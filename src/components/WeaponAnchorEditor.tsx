import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HandSocket, getHandSocket } from '../utils/handSockets';
import { LpcCharacterConfig } from '../types/game';
import { getCharacterLayerSpecs, LayerSpec } from './LpcCharacterCanvas';

interface WeaponAnchorEditorProps {
  config?: Partial<LpcCharacterConfig>;
  darkMode?: boolean;
  onClose?: () => void;
}

type Action = 'walk' | 'slash' | 'spellcast';
type Direction = 'south' | 'west' | 'east' | 'north';

const DIR_INDEX = { north: 0, west: 1, south: 2, east: 3 };
const ACTION_ROW_OFFSET = { spellcast: 0, walk: 8, slash: 12 };
const MAX_FRAMES = { spellcast: 7, walk: 8, slash: 6 };

export const WeaponAnchorEditor: React.FC<WeaponAnchorEditorProps> = ({
  config = { body: 'male', skinColor: 'light' },
  darkMode: _darkMode = true,
  onClose
}) => {
  const [action, setAction] = useState<Action>('walk');
  const [direction, setDirection] = useState<Direction>('south');
  const [frame, setFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [modifiedSockets, setModifiedSockets] = useState<Record<string, HandSocket>>({});
  const [showExport, setShowExport] = useState<boolean>(false);
  const [onionSkin, setOnionSkin] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  const getSocketKey = useCallback((a: Action, d: Direction, f: number) => `${a}_${d}_${f}`, []);
  
  const getCurrentSocket = useCallback((a: Action = action, d: Direction = direction, f: number = frame): HandSocket => {
    const key = getSocketKey(a, d, f);
    if (modifiedSockets[key]) return modifiedSockets[key];
    return getHandSocket(a, d, f);
  }, [action, direction, frame, modifiedSockets, getSocketKey]);
  
  const updateSocket = (updates: Partial<HandSocket>) => {
    const key = getSocketKey(action, direction, frame);
    const current = getCurrentSocket();
    setModifiedSockets(prev => ({
      ...prev,
      [key]: { ...current, ...updates }
    }));
  };

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      // Create a dummy config to use getCharacterLayerSpecs
      const dummyConfig = { body: 'male', skinColor: 'light', ...config } as any;
      const specs = getCharacterLayerSpecs(dummyConfig, action, null, true);
      
      const newImages: Record<string, HTMLImageElement> = { ...images };
      
      for (const spec of specs) {
        if (!newImages[spec.url]) {
          const img = new Image();
          img.src = spec.url;
          await new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
          newImages[spec.url] = img;
        }
      }
      setImages(newImages);
    };
    
    loadImages();
  }, [config, action]);

  // Playback
  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();
    const fps = 8;
    const interval = 1000 / fps;
    
    const loop = (time: number) => {
      if (isPlaying) {
        if (time - lastTime > interval) {
          setFrame(f => (f + 1) % MAX_FRAMES[action]);
          lastTime = time;
        }
        animationFrame = requestAnimationFrame(loop);
      }
    };
    
    if (isPlaying) {
      animationFrame = requestAnimationFrame(loop);
    }
    
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, action]);

  // Reset frame when action changes
  useEffect(() => {
    setFrame(0);
  }, [action, direction]);

  const drawCharacter = useCallback((ctx: CanvasRenderingContext2D, f: number, a: Action, d: Direction, alpha: number = 1) => {
    const dummyConfig = { body: 'male', skinColor: 'light', ...config } as any;
    const specs = getCharacterLayerSpecs(dummyConfig, a, null, true);
    
    ctx.globalAlpha = alpha;
    
    for (const spec of specs) {
      const img = images[spec.url];
      if (!img || img.width === 0) continue;
      
      let srcX = 0;
      let srcY = 0;
      
      if (img.height >= 1344) {
        srcY = (ACTION_ROW_OFFSET[a] + DIR_INDEX[d]) * 64;
      } else {
        srcY = (DIR_INDEX[d] % Math.max(1, Math.floor(img.height / 64))) * 64;
      }
      
      srcX = (f % MAX_FRAMES[a]) * 64;
      
      ctx.drawImage(img, srcX, srcY, 64, 64, 0, 0, 256, 256);
    }
    ctx.globalAlpha = 1;
  }, [config, images]);

  const drawWeaponOverlay = useCallback((ctx: CanvasRenderingContext2D, socket: HandSocket, alpha: number = 1) => {
    const px = socket.x * 4;
    const py = socket.y * 4;
    
    ctx.globalAlpha = alpha;
    
    // Draw weapon preview
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((socket.angle * Math.PI) / 180);
    
    // Simple sword
    ctx.fillStyle = socket.renderOrder === 'behind' ? 'rgba(100, 100, 100, 0.8)' : 'rgba(200, 200, 200, 0.9)';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // Handle
    ctx.fillRect(-4, 0, 8, 20);
    ctx.strokeRect(-4, 0, 8, 20);
    // Crossguard
    ctx.fillRect(-12, -4, 24, 6);
    ctx.strokeRect(-12, -4, 24, 6);
    // Blade
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(6, -4);
    ctx.lineTo(6, -60);
    ctx.lineTo(0, -70);
    ctx.lineTo(-6, -60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
    
    // Draw crosshair at anchor
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 10, py);
    ctx.lineTo(px + 10, py);
    ctx.moveTo(px, py - 10);
    ctx.lineTo(px, py + 10);
    ctx.stroke();

    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }, []);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background grid
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 256; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
    }
    
    const currentSocket = getCurrentSocket();
    
    if (onionSkin && !isPlaying) {
      const prevFrame = (frame - 1 + MAX_FRAMES[action]) % MAX_FRAMES[action];
      const nextFrame = (frame + 1) % MAX_FRAMES[action];
      
      drawCharacter(ctx, prevFrame, action, direction, 0.3);
      drawWeaponOverlay(ctx, getCurrentSocket(action, direction, prevFrame), 0.2);
      
      drawCharacter(ctx, nextFrame, action, direction, 0.3);
      drawWeaponOverlay(ctx, getCurrentSocket(action, direction, nextFrame), 0.2);
    }
    
    if (currentSocket.renderOrder === 'behind') {
      drawWeaponOverlay(ctx, currentSocket);
      drawCharacter(ctx, frame, action, direction);
    } else {
      drawCharacter(ctx, frame, action, direction);
      drawWeaponOverlay(ctx, currentSocket);
    }
    
  }, [frame, action, direction, images, modifiedSockets, onionSkin, isPlaying, drawCharacter, drawWeaponOverlay, getCurrentSocket]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleCanvasMouseMove(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = Math.round((e.clientX - rect.left) / 4);
    const y = Math.round((e.clientY - rect.top) / 4);
    
    if (e.shiftKey) {
       // Optional: drag to rotate
       const current = getCurrentSocket();
       const dx = x - current.x;
       const dy = y - current.y;
       let angle = Math.round(Math.atan2(dy, dx) * 180 / Math.PI + 90);
       if (angle > 180) angle -= 360;
       updateSocket({ angle });
    } else {
      updateSocket({ x, y });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const copyToOpposite = () => {
    const oppDir = direction === 'east' ? 'west' : direction === 'west' ? 'east' : direction;
    if (oppDir === direction) return;
    
    const current = getCurrentSocket();
    const key = getSocketKey(action, oppDir, frame);
    setModifiedSockets(prev => ({
      ...prev,
      [key]: {
        ...current,
        x: 64 - current.x,
        angle: -current.angle,
        renderOrder: current.renderOrder === 'front' ? 'behind' : 'front' // Often opposite, but keep it simple
      }
    }));
  };

  const generateExportCode = () => {
    return JSON.stringify(modifiedSockets, null, 2);
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(9, 9, 11, 0.95)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column' as const,
      color: '#e4e4e7',
      fontFamily: 'sans-serif'
    },
    header: {
      display: 'flex',
      padding: '16px',
      backgroundColor: '#18181b',
      borderBottom: '1px solid #3f3f46',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      margin: 0,
      fontWeight: 900,
      color: 'var(--neon-cyan, #22d3ee)',
      textShadow: '0 0 10px rgba(34, 211, 238, 0.5)'
    },
    controlsRow: {
      display: 'flex',
      gap: '12px'
    },
    button: {
      backgroundColor: '#27272a',
      border: '1px solid #3f3f46',
      color: '#e4e4e7',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      outline: 'none'
    },
    activeButton: {
      backgroundColor: 'var(--neon-cyan, #22d3ee)',
      color: '#09090b',
      boxShadow: '0 0 8px rgba(34, 211, 238, 0.4)'
    },
    main: {
      display: 'flex',
      flex: 1,
      padding: '24px',
      gap: '24px',
      overflow: 'hidden'
    },
    canvasContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      backgroundColor: '#18181b',
      border: '2px solid #3f3f46',
      borderRadius: '8px',
      position: 'relative' as const
    },
    canvas: {
      width: '512px',
      height: '512px',
      imageRendering: 'pixelated' as const,
      cursor: 'crosshair',
      backgroundColor: '#09090b'
    },
    panel: {
      width: '320px',
      backgroundColor: '#18181b',
      border: '1px solid #3f3f46',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      overflowY: 'auto' as const
    },
    panelGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'
    },
    label: {
      fontSize: '12px',
      fontWeight: 700,
      color: '#a1a1aa',
      textTransform: 'uppercase' as const
    },
    inputRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    input: {
      backgroundColor: '#09090b',
      border: '1px solid #3f3f46',
      color: '#e4e4e7',
      padding: '8px',
      borderRadius: '4px',
      width: '100%',
      fontFamily: 'monospace'
    },
    slider: {
      width: '100%',
      cursor: 'pointer'
    },
    footer: {
      padding: '16px',
      backgroundColor: '#18181b',
      borderTop: '1px solid #3f3f46',
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      overflowX: 'auto' as const
    },
    frameThumb: {
      width: '48px',
      height: '48px',
      border: '2px solid #3f3f46',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      backgroundColor: '#09090b'
    },
    activeFrameThumb: {
      borderColor: 'var(--neon-cyan, #22d3ee)',
      boxShadow: '0 0 8px rgba(34, 211, 238, 0.4)'
    }
  };

  const currentSocket = getCurrentSocket();
  const maxFrames = MAX_FRAMES[action];

  return (
    <div style={styles.overlay}>
      <div style={styles.header}>
        <h2 style={styles.title}>WEAPON ANCHOR EDITOR</h2>
        <div style={styles.controlsRow}>
          {(['walk', 'slash', 'spellcast'] as Action[]).map(a => (
            <button key={a} style={{...styles.button, ...(action === a ? styles.activeButton : {})}} onClick={() => setAction(a)}>
              {a.toUpperCase()}
            </button>
          ))}
          <div style={{ width: '1px', backgroundColor: '#3f3f46', margin: '0 8px' }} />
          {(['south', 'west', 'east', 'north'] as Direction[]).map(d => (
            <button key={d} style={{...styles.button, ...(direction === d ? styles.activeButton : {})}} onClick={() => setDirection(d)}>
              {d.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
        <button style={styles.button} onClick={onClose}>CLOSE</button>
      </div>

      <div style={styles.main}>
        <div style={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            width={256}
            height={256}
            style={styles.canvas}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
        </div>

        <div style={styles.panel}>
          <div style={styles.panelGroup}>
            <span style={styles.label}>Playback</span>
            <div style={styles.controlsRow}>
              <button style={styles.button} onClick={() => setFrame((frame - 1 + maxFrames) % maxFrames)}>◀️</button>
              <button style={{...styles.button, flex: 1}} onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
              <button style={styles.button} onClick={() => setFrame((frame + 1) % maxFrames)}>▶️</button>
            </div>
            <div style={{ textAlign: 'center', fontSize: '12px', fontFamily: 'monospace' }}>
              FRAME {frame + 1} / {maxFrames}
            </div>
          </div>

          <div style={styles.panelGroup}>
            <label style={styles.label}>
              <input type="checkbox" checked={onionSkin} onChange={e => setOnionSkin(e.target.checked)} />
              Onion Skin
            </label>
          </div>

          <div style={{ height: '1px', backgroundColor: '#3f3f46', margin: '8px 0' }} />

          <div style={styles.panelGroup}>
            <span style={styles.label}>Position (64x64)</span>
            <div style={styles.inputRow}>
              <span>X:</span>
              <input 
                type="number" 
                style={styles.input} 
                value={currentSocket.x} 
                onChange={e => updateSocket({ x: parseInt(e.target.value) || 0 })}
              />
              <span>Y:</span>
              <input 
                type="number" 
                style={styles.input} 
                value={currentSocket.y} 
                onChange={e => updateSocket({ y: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div style={styles.panelGroup}>
            <span style={styles.label}>Rotation Angle ({currentSocket.angle}°)</span>
            <input 
              type="range" 
              min="-180" max="180" 
              style={styles.slider} 
              value={currentSocket.angle} 
              onChange={e => updateSocket({ angle: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div style={styles.panelGroup}>
            <span style={styles.label}>Render Order</span>
            <div style={styles.controlsRow}>
              <button 
                style={{...styles.button, flex: 1, ...(currentSocket.renderOrder === 'front' ? styles.activeButton : {})}} 
                onClick={() => updateSocket({ renderOrder: 'front' })}
              >
                FRONT
              </button>
              <button 
                style={{...styles.button, flex: 1, ...(currentSocket.renderOrder === 'behind' ? styles.activeButton : {})}} 
                onClick={() => updateSocket({ renderOrder: 'behind' })}
              >
                BEHIND
              </button>
            </div>
          </div>

          {(direction === 'east' || direction === 'west') && (
            <button style={styles.button} onClick={copyToOpposite}>
              Mirror to {direction === 'east' ? 'West' : 'East'}
            </button>
          )}

          <div style={{ flex: 1 }} />

          <button style={{...styles.button, backgroundColor: '#09090b'}} onClick={() => setShowExport(!showExport)}>
            {showExport ? 'HIDE EXPORT' : 'EXPORT JSON'}
          </button>
          
          {showExport && (
            <textarea 
              readOnly 
              style={{...styles.input, height: '120px', resize: 'none', fontSize: '10px'}} 
              value={generateExportCode()}
            />
          )}
        </div>
      </div>

      <div style={styles.footer}>
        {Array.from({ length: maxFrames }).map((_, i) => (
          <div 
            key={i}
            style={{...styles.frameThumb, ...(frame === i ? styles.activeFrameThumb : {})}}
            onClick={() => { setFrame(i); setIsPlaying(false); }}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
};
