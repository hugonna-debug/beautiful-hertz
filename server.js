import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Firestore } from '@google-cloud/firestore';
import { OAuth2Client } from 'google-auth-library';

import { sanitizeAndMigrateState } from './src/utils/stateSanitizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firestore. Uses application default credentials automatically when running on GCP Cloud Run.
const db = new Firestore();
const authClient = new OAuth2Client();

// Serve Vite production build static assets from dist/ with cache controls
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html') || filePath.endsWith('sw.js') || filePath.endsWith('manifest.json')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.includes('assets')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Helper: Verify Google Auth token
async function verifyGoogleToken(token) {
  const clientID = process.env.VITE_GOOGLE_CLIENT_ID || '';
  if (!token) throw new Error('Token is required');
  
  // If no VITE_GOOGLE_CLIENT_ID is set up, fallback to mock verify for ease of sandbox deployment config
  if (!clientID || clientID === 'placeholder-id') {
    console.warn('VITE_GOOGLE_CLIENT_ID not set. Using fallback verification.');
    return {
      email: 'sandbox-user@minmax.local',
      name: 'Sandbox crusader'
    };
  }

  const ticket = await authClient.verifyIdToken({
    idToken: token,
    audience: clientID,
  });
  return ticket.getPayload();
}

// 1. Google Authentication Endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const payload = await verifyGoogleToken(token);
    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const email = payload.email.toLowerCase();
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      // First time registering
      await userRef.set({
        email,
        name: payload.name || 'Crusader',
        createdAt: new Date().toISOString(),
        username: ''
      });
      return res.json({ email, name: payload.name, username: '' });
    } else {
      const data = doc.data();
      return res.json({ email, name: data.name, username: data.username || '' });
    }
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ message: err.message || 'Internal server auth error' });
  }
});

// 2. Local DEV Mock Login Endpoint (for ease of sandbox testing without OAuth Client ID setup)
app.post('/api/auth/mock', async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
        username: ''
      });
      return res.json({ email, name: email.split('@')[0], username: '' });
    } else {
      const data = doc.data();
      return res.json({ email, name: data.name, username: data.username || '' });
    }
  } catch (err) {
    console.error('Mock auth error:', err);
    return res.status(500).json({ message: 'Mock auth failed' });
  }
});

// 3. Register Custom Username Endpoint
app.post('/api/user/username', async (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).json({ message: 'Email and username are required' });
    }
    const cleanUsername = username.trim().toLowerCase();

    // Check if username is already taken by another account
    const snapshot = await db.collection('users').where('username', '==', cleanUsername).get();
    if (!snapshot.empty) {
      // Check if it belongs to the active requester
      const existingDoc = snapshot.docs[0];
      if (existingDoc.id !== email.toLowerCase()) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    const userRef = db.collection('users').doc(email.toLowerCase());
    await userRef.set({ username: cleanUsername }, { merge: true });

    return res.json({ success: true, username: cleanUsername });
  } catch (err) {
    console.error('Username registration error:', err);
    return res.status(500).json({ message: 'Failed to register username' });
  }
});

// 4. Session Claim Endpoint (switches active device session)
app.post('/api/session/claim', async (req, res) => {
  try {
    const { email, sessionId, deviceName } = req.body;
    if (!email || !sessionId) {
      return res.status(400).json({ message: 'Email and sessionId are required' });
    }

    const userRef = db.collection('users').doc(email.toLowerCase());
    const doc = await userRef.get();
    const device = deviceName || 'Web Browser';
    const now = new Date().toISOString();

    if (!doc.exists) {
      await userRef.set({
        email,
        activeSessionId: sessionId,
        activeSessionDevice: device,
        activeSessionUpdatedAt: now,
        updatedAt: now
      }, { merge: true });
      return res.json({ success: true, state: null });
    }

    const data = doc.data() || {};
    const sanitizedState = data.state ? sanitizeAndMigrateState(data.state) : null;
    await userRef.set({
      activeSessionId: sessionId,
      activeSessionDevice: device,
      activeSessionUpdatedAt: now
    }, { merge: true });

    return res.json({
      success: true,
      state: sanitizedState,
      activeSessionId: sessionId,
      activeSessionDevice: device
    });
  } catch (err) {
    console.error('Session claim error:', err);
    return res.status(500).json({ message: 'Failed to claim session' });
  }
});

// 5. Session Heartbeat Check Endpoint
app.post('/api/session/heartbeat', async (req, res) => {
  try {
    const { email, sessionId } = req.body;
    if (!email || !sessionId) {
      return res.status(400).json({ message: 'Email and sessionId are required' });
    }

    const userRef = db.collection('users').doc(email.toLowerCase());
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.json({ active: true });
    }

    const data = doc.data() || {};
    const activeSessionId = data.activeSessionId;

    if (!activeSessionId || activeSessionId === sessionId) {
      return res.json({ active: true });
    } else {
      return res.json({
        active: false,
        otherDeviceName: data.activeSessionDevice || 'Another Device'
      });
    }
  } catch (err) {
    console.error('Session heartbeat error:', err);
    return res.status(500).json({ message: 'Failed to check session heartbeat' });
  }
});

// 6. Save Game State Endpoint (Sanitizes & checks active session ownership)
app.post('/api/save', async (req, res) => {
  try {
    const { email, state, sessionId } = req.body;
    if (!email || !state) {
      return res.status(400).json({ message: 'Email and game state are required' });
    }

    const userRef = db.collection('users').doc(email.toLowerCase());
    const doc = await userRef.get();

    if (doc.exists) {
      const data = doc.data() || {};
      if (sessionId && data.activeSessionId && data.activeSessionId !== sessionId) {
        return res.json({
          success: false,
          conflict: true,
          otherDeviceName: data.activeSessionDevice || 'Another Device'
        });
      }
    }

    const sanitizedState = sanitizeAndMigrateState(state);

    await userRef.set({
      state: sanitizedState,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return res.json({ success: true });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ message: 'Failed to write save data to cloud' });
  }
});

// 7. Load Game State Endpoint (Returns sanitized and migrated state)
app.get('/api/load', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: 'Email query parameter is required' });
    }

    const userRef = db.collection('users').doc(email.toString().toLowerCase());
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.json({ state: null, activeSessionId: null, activeSessionDevice: null });
    }

    const data = doc.data() || {};
    const sanitizedState = data.state ? sanitizeAndMigrateState(data.state) : null;
    return res.json({
      state: sanitizedState,
      activeSessionId: data.activeSessionId || null,
      activeSessionDevice: data.activeSessionDevice || null
    });
  } catch (err) {
    console.error('Load error:', err);
    return res.status(500).json({ message: 'Failed to retrieve save data from cloud' });
  }
});

// 8. Repair Account Endpoint (Repairs single user account state)
app.post('/api/account/repair', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const cleanEmail = email.toString().toLowerCase();
    const userRef = db.collection('users').doc(cleanEmail);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const data = doc.data() || {};
    let currentState = data.state;
    const repairedState = sanitizeAndMigrateState(currentState);

    await userRef.set({
      state: repairedState,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return res.json({
      success: true,
      message: `Account data for ${cleanEmail} successfully repaired and updated!`,
      state: repairedState
    });
  } catch (err) {
    console.error('Account repair error:', err);
    return res.status(500).json({ message: 'Failed to repair account save data' });
  }
});

// 9. Batch Repair All Stale Google Accounts Endpoint
app.post('/api/admin/repair-stale-accounts', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    let processedCount = 0;
    let repairedCount = 0;
    let resetCount = 0;

    for (const userDoc of snapshot.docs) {
      processedCount++;
      const data = userDoc.data() || {};
      if (data.state) {
        try {
          const repairedState = sanitizeAndMigrateState(data.state);
          await userDoc.ref.set({
            state: repairedState,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          repairedCount++;
        } catch (e) {
          console.warn(`Failed to repair state for user ${userDoc.id}, resetting stale state:`, e);
          await userDoc.ref.update({
            state: null,
            updatedAt: new Date().toISOString()
          });
          resetCount++;
        }
      }
    }

    return res.json({
      success: true,
      processedCount,
      repairedCount,
      resetCount,
      message: `Processed ${processedCount} accounts: ${repairedCount} repaired, ${resetCount} reset stale data.`
    });
  } catch (err) {
    console.error('Batch repair error:', err);
    return res.status(500).json({ message: 'Batch repair process failed' });
  }
});

// Catch-all: serve index.html with no-cache headers for React PWA client-side routing
app.get(/.*/, (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`MIN-MAXXED express server listening on port ${PORT}`);
});
