import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState } from '../types/game';
import { LpcCharacterCanvas } from '../components/LpcCharacterCanvas';
import {
  Vector2D,
  AnchorPointSpec,
  SpriteBatchItem,
  PRESET_ANCHOR_LABELS,
  computeAnchorVector,
  downloadJSONFile,
  exportAnchorsToJSON,
  WeaponPipelineStats,
  UnverifiedWeapon,
  fetchPipelineStats,
  fetchUnverifiedWeapons,
  fetchAnchoredWeapons,
  fetchSkippedWeapons,
  anchorWeapon,
  unanchorWeapon,
  skipWeapon,
  unskipWeapon,
} from './anchorStudioCatalog';

interface AnchorStudioProps {
  state: GameState;
  onClose?: () => void;
}

export const AnchorStudio: React.FC<AnchorStudioProps> = ({ state }) => {
  const [studioMode, setStudioMode] = useState<'mode1_animation' | 'mode2_batch'>('mode1_animation');

  // Mode 1 State — LOCKED to slash/east (the arena animation)
  const action = 'slash' as const;
  const direction = 'east' as const;
  const ARENA_FRAMES = [1, 2, 3, 4, 5, 4, 3, 2]; // The exact loop BattleConsole uses
  const TOTAL_SLASH_FRAMES = 6; // Frames 0-5 are the unique source frames
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(120);
  const [activeLabel, setActiveLabel] = useState<string>('handle_1h');
  const [customLabelInput, setCustomLabelInput] = useState<string>('');
  const [customLabels, setCustomLabels] = useState(PRESET_ANCHOR_LABELS);

  // Mode 1 Frame Anchor Points map key: `slash_east_${frameIndex}`
  const [frameAnchorsMap, setFrameAnchorsMap] = useState<Record<string, Record<string, AnchorPointSpec>>>({});
  const [clickStep, setClickStep] = useState<'base' | 'tip'>('base');
  const [arenaSaveMsg, setArenaSaveMsg] = useState<string | null>(null);

  // Mode 2 State
  const [pipelineTab, setPipelineTab] = useState<'unverified' | 'anchored' | 'skipped'>('unverified');
  const [batchSprites, setBatchSprites] = useState<SpriteBatchItem[]>([]);
  const [batchViewMode, setBatchViewMode] = useState<'grid' | 'rapid'>('rapid');
  const [activeBatchIndex, setActiveBatchIndex] = useState<number>(0);
  const [batchCategoryFilter, setBatchCategoryFilter] = useState<string>('all');
  const [batchClickStep, setBatchClickStep] = useState<'base' | 'tip'>('base');

  // Pipeline State
  const [pipelineStats, setPipelineStats] = useState<WeaponPipelineStats>({ unverified: 0, anchored: 0, skipped: 0, total: 0 });
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineMessage, setPipelineMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const batchCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch weapons from dev API based on active pipeline tab (unverified / anchored / skipped)
  const loadPipelineWeapons = useCallback(async (tab: 'unverified' | 'anchored' | 'skipped' = pipelineTab) => {
    setPipelineLoading(true);
    try {
      const statsPromise = fetchPipelineStats();
      let weaponsPromise: Promise<UnverifiedWeapon[]>;
      if (tab === 'anchored') weaponsPromise = fetchAnchoredWeapons();
      else if (tab === 'skipped') weaponsPromise = fetchSkippedWeapons();
      else weaponsPromise = fetchUnverifiedWeapons();

      const [weapons, stats] = await Promise.all([weaponsPromise, statsPromise]);
      setBatchSprites(weapons.map(w => ({
        id: w.name.replace(/\.(png|jpg|jpeg|gif|webp|bmp)$/i, ''),
        name: w.name.replace(/\.(png|jpg|jpeg|gif|webp|bmp)$/i, '').replace(/[_-]/g, ' '),
        url: w.url,
        category: 'weapon' as const,
        baseAnchor: w.anchor ? { x: w.anchor.baseX, y: w.anchor.baseY } : undefined,
        tipAnchor: w.anchor ? { x: w.anchor.tipX, y: w.anchor.tipY } : undefined,
        angle: w.anchor?.angle,
        distance: w.anchor?.distance,
        isMarked: !!w.anchor,
      })));
      setPipelineStats(stats);
      setActiveBatchIndex(0);
      setBatchClickStep('base');
    } catch (err) {
      console.error('Failed to load weapons pipeline:', err);
    } finally {
      setPipelineLoading(false);
    }
  }, [pipelineTab]);

  useEffect(() => {
    if (studioMode === 'mode2_batch') {
      loadPipelineWeapons(pipelineTab);
    }
  }, [studioMode, pipelineTab, loadPipelineWeapons]);

  // Clear pipeline messages after 3s
  useEffect(() => {
    if (!pipelineMessage) return;
    const t = setTimeout(() => setPipelineMessage(null), 3000);
    return () => clearTimeout(t);
  }, [pipelineMessage]);

  // Load existing hand socket overrides from arena on mount
  useEffect(() => {
    loadArenaOverrides();
  }, []);

  const loadArenaOverrides = async () => {
    try {
      const res = await fetch('/dev-api/handsockets');
      const data = await res.json();
      if (data.slashEast && Array.isArray(data.slashEast) && data.slashEast.length > 0) {
        const map: Record<string, Record<string, AnchorPointSpec>> = {};
        data.slashEast.forEach((socket: any, i: number) => {
          const key = `slash_east_${i}`;
          map[key] = {
            handle_1h: {
              id: 'handle_1h',
              label: '1H Weapon Handle',
              category: 'weapon',
              base: { x: socket.x, y: socket.y },
              tip: socket.tipX !== undefined ? { x: socket.tipX, y: socket.tipY } : undefined,
              angle: socket.angle,
              distance: socket.distance,
            }
          };
        });
        setFrameAnchorsMap(prev => ({ ...prev, ...map }));
        setArenaSaveMsg('\u2705 Loaded existing arena overrides');
      }
    } catch {}
  };

  // Clear save messages after 3s
  useEffect(() => {
    if (!arenaSaveMsg) return;
    const t = setTimeout(() => setArenaSaveMsg(null), 3000);
    return () => clearTimeout(t);
  }, [arenaSaveMsg]);

  // Playback Loop for Mode 1 — uses arena sequence [1,2,3,4,5,4,3,2]
  useEffect(() => {
    if (!isPlaying) return;
    let seqIdx = 0;
    const timer = setInterval(() => {
      setFrameIndex(ARENA_FRAMES[seqIdx % ARENA_FRAMES.length]);
      seqIdx++;
    }, playbackSpeed);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Keydown Listener for Mode 2 Rapid Marking ([ENTER] to confirm & next)
  useEffect(() => {
    if (studioMode !== 'mode2_batch' || batchViewMode !== 'rapid') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        advanceBatchItem();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [studioMode, batchViewMode, activeBatchIndex, batchSprites]);

  const getCurrentKey = () => `${action}_${direction}_${frameIndex}`;

  const currentFrameAnchors = frameAnchorsMap[getCurrentKey()] || {};
  const currentSpec: AnchorPointSpec = currentFrameAnchors[activeLabel] || {
    id: activeLabel,
    label: customLabels.find(l => l.id === activeLabel)?.name || activeLabel,
    category: 'weapon',
    base: { x: 20, y: 44 },
    tip: { x: 45, y: 18 },
    angle: -30,
    distance: 35
  };

  // Render Vector Overlay on Mode 1 Canvas
  useEffect(() => {
    if (studioMode !== 'mode1_animation') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = canvas.width / 64;
    const bx = currentSpec.base.x * scale;
    const by = currentSpec.base.y * scale;

    if (currentSpec.tip) {
      const tx = currentSpec.tip.x * scale;
      const ty = currentSpec.tip.y * scale;
      const distPx = (currentSpec.distance || 35) * scale;

      // Draw Fixed Distance Orbit Circle
      ctx.beginPath();
      ctx.arc(bx, by, distPx, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      // Draw Vector Line connecting Base to Tip
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.stroke();

      // Draw Tip Arrow / Target Point
      ctx.beginPath();
      ctx.arc(tx, ty, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tip Label
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('ORIENTATION (TIP)', tx + 10, ty + 4);
    }

    // Draw Base Handle Point (Green)
    ctx.beginPath();
    ctx.arc(bx, by, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Base Label
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('HANDLE BASE', bx + 10, by - 6);

  }, [studioMode, currentSpec, action, direction, frameIndex]);

  // Render Vector Overlay on Mode 2 Batch Canvas (Visual Indicators for Grip & Orientation Tip)
  useEffect(() => {
    if (studioMode !== 'mode2_batch' || batchViewMode !== 'rapid') return;
    const canvas = batchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sprite = batchSprites[activeBatchIndex];
    if (!sprite) return;

    const scale = canvas.width / 64;

    if (sprite.baseAnchor) {
      const bx = sprite.baseAnchor.x * scale;
      const by = sprite.baseAnchor.y * scale;

      if (sprite.tipAnchor) {
        const tx = sprite.tipAnchor.x * scale;
        const ty = sprite.tipAnchor.y * scale;
        const distPx = (sprite.distance || 35) * scale;

        // Fixed Distance Orbit Circle
        ctx.beginPath();
        ctx.arc(bx, by, distPx, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // Vector Line connecting Grip Base to Tip
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.stroke();

        // Draw Tip Point (Blue Circle)
        ctx.beginPath();
        ctx.arc(tx, ty, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tip Text Label
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`TIP (${sprite.angle ?? 0}°)`, tx + 10, ty + 4);
      } else {
        // Highlight pulsing ring for grip point while awaiting tip click
        ctx.beginPath();
        ctx.arc(bx, by, 16, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
      }

      // Draw Base Handle Point (Green Circle)
      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Base Label
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('GRIP BASE', bx + 10, by - 6);
    }
  }, [studioMode, batchViewMode, activeBatchIndex, batchSprites, batchClickStep]);

  // Click on Mode 1 Canvas to set 2-Point Vector Anchors
  const handleMode1CanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to 64x64 frame space
    const scale = 64 / canvas.width;
    const frameX = Math.round(clickX * scale);
    const frameY = Math.round(clickY * scale);

    const key = getCurrentKey();
    const existing = currentFrameAnchors[activeLabel] || { ...currentSpec };

    if (clickStep === 'base') {
      // SINGLE ANCHOR ENFORCEMENT: Clear ALL previous anchors on this frame
      // Each weapon/frame gets exactly 1 anchor point + orientation
      const freshSpec: AnchorPointSpec = {
        ...existing,
        id: activeLabel,
        label: customLabels.find(l => l.id === activeLabel)?.name || activeLabel,
        base: { x: frameX, y: frameY }
      };
      if (freshSpec.tip) {
        const { angle, distance } = computeAnchorVector(freshSpec.base, freshSpec.tip);
        freshSpec.angle = angle;
        freshSpec.distance = distance;
      }
      // Replace entire frame anchors with just this one (reset previous)
      setFrameAnchorsMap(prev => ({
        ...prev,
        [key]: { [activeLabel]: freshSpec }
      }));
      setClickStep('tip');
    } else {
      const updatedSpec: AnchorPointSpec = {
        ...existing,
        tip: { x: frameX, y: frameY }
      };
      const { angle, distance } = computeAnchorVector(updatedSpec.base, updatedSpec.tip);
      updatedSpec.angle = angle;
      updatedSpec.distance = distance;

      setFrameAnchorsMap(prev => ({
        ...prev,
        [key]: { [activeLabel]: updatedSpec }
      }));
      setClickStep('base');
    }
  };

  // Direct Numeric Updates for Base Anchor X/Y
  const updateBaseCoordinates = (newX: number, newY: number) => {
    const bx = Math.max(0, Math.min(64, newX));
    const by = Math.max(0, Math.min(64, newY));
    const key = getCurrentKey();
    const existing = currentFrameAnchors[activeLabel] || { ...currentSpec };

    let tip = existing.tip || { x: bx + 25, y: by - 25 };
    if (existing.distance !== undefined && existing.angle !== undefined) {
      const rad = (existing.angle * Math.PI) / 180;
      tip = {
        x: Math.round(bx + existing.distance * Math.cos(rad)),
        y: Math.round(by + existing.distance * Math.sin(rad))
      };
    }
    const { angle, distance } = computeAnchorVector({ x: bx, y: by }, tip);

    const updated: AnchorPointSpec = {
      ...existing,
      base: { x: bx, y: by },
      tip,
      angle,
      distance
    };

    setFrameAnchorsMap(prev => ({
      ...prev,
      [key]: { ...prev[key], [activeLabel]: updated }
    }));
  };

  // Direct Numeric Updates for Angle & Fixed Distance
  const updateAngleAndDistance = (newAngle: number, newDistance: number) => {
    const key = getCurrentKey();
    const existing = currentFrameAnchors[activeLabel] || { ...currentSpec };
    const bx = existing.base.x;
    const by = existing.base.y;

    const rad = (newAngle * Math.PI) / 180;
    const tipX = Math.round(bx + newDistance * Math.cos(rad));
    const tipY = Math.round(by + newDistance * Math.sin(rad));

    const updated: AnchorPointSpec = {
      ...existing,
      tip: { x: tipX, y: tipY },
      angle: newAngle,
      distance: newDistance
    };

    setFrameAnchorsMap(prev => ({
      ...prev,
      [key]: { ...prev[key], [activeLabel]: updated }
    }));
  };

  // Apply Current Anchor to All 6 Slash-East Frames
  const applyAnchorToAllFrames = () => {
    setFrameAnchorsMap(prev => {
      const next = { ...prev };
      for (let f = 0; f < TOTAL_SLASH_FRAMES; f++) {
        const k = `slash_east_${f}`;
        next[k] = { ...next[k], [activeLabel]: { ...currentSpec } };
      }
      return next;
    });
  };

  // Save all 6 frames to arena via dev API
  const saveToArena = async () => {
    const sockets: any[] = [];
    for (let f = 0; f < TOTAL_SLASH_FRAMES; f++) {
      const key = `slash_east_${f}`;
      const frameData = frameAnchorsMap[key];
      const anchor = frameData?.[activeLabel] || currentSpec;
      sockets.push({
        x: anchor.base.x,
        y: anchor.base.y,
        angle: anchor.angle ?? 0,
        renderOrder: 'front',
        pivotX: 20,
        pivotY: 44,
        // Also save tip for re-loading
        tipX: anchor.tip?.x,
        tipY: anchor.tip?.y,
        distance: anchor.distance,
      });
    }
    try {
      const res = await fetch('/dev-api/handsockets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slashEast: sockets }),
      });
      const result = await res.json();
      setArenaSaveMsg(`\u2705 ${result.message} — Reload game to see changes`);
    } catch (err: any) {
      setArenaSaveMsg(`\u274c Save failed: ${err.message}`);
    }
  };

  // Add Custom Anchor Label
  const handleAddCustomLabel = () => {
    if (!customLabelInput.trim()) return;
    const id = customLabelInput.toLowerCase().replace(/\s+/g, '_');
    if (!customLabels.some(l => l.id === id)) {
      const newLabel = { id, name: customLabelInput.trim(), category: 'weapon' as const };
      setCustomLabels(prev => [...prev, newLabel]);
      setActiveLabel(id);
    }
    setCustomLabelInput('');
  };

  // Mode 2 Rapid Marking Canvas Click
  const handleBatchCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = batchCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 64 / canvas.width;
    const px = Math.round((e.clientX - rect.left) * scale);
    const py = Math.round((e.clientY - rect.top) * scale);

    const currentItem = batchSprites[activeBatchIndex];
    if (!currentItem) return;

    if (batchClickStep === 'base') {
      const updated = { ...currentItem, baseAnchor: { x: px, y: py } };
      if (updated.tipAnchor) {
        const { angle, distance } = computeAnchorVector(updated.baseAnchor, updated.tipAnchor);
        updated.angle = angle;
        updated.distance = distance;
        updated.isMarked = true;
      }
      setBatchSprites(prev => prev.map((item, idx) => idx === activeBatchIndex ? updated : item));
      setBatchClickStep('tip');
    } else {
      const base = currentItem.baseAnchor || { x: 20, y: 44 };
      const tip = { x: px, y: py };
      const { angle, distance } = computeAnchorVector(base, tip);
      const updated: SpriteBatchItem = {
        ...currentItem,
        baseAnchor: base,
        tipAnchor: tip,
        angle,
        distance,
        isMarked: true
      };
      setBatchSprites(prev => prev.map((item, idx) => idx === activeBatchIndex ? updated : item));
      setBatchClickStep('base');
    }
  };

  // ── Pipeline Actions ──────────────────────────────────────────
  const handleAnchorAndAdvance = async () => {
    const sprite = batchSprites[activeBatchIndex];
    if (!sprite) return;
    if (!sprite.baseAnchor || !sprite.tipAnchor) {
      setPipelineMessage('⚠️ Set both grip point and orientation before anchoring!');
      return;
    }
    setPipelineLoading(true);
    try {
      const filename = sprite.url.split('/').pop() || '';
      const result = await anchorWeapon(filename, {
        baseX: sprite.baseAnchor.x,
        baseY: sprite.baseAnchor.y,
        tipX: sprite.tipAnchor.x,
        tipY: sprite.tipAnchor.y,
        angle: sprite.angle || 0,
        distance: sprite.distance || 0,
      });
      setPipelineMessage(`✅ ${result.message}`);
      // Remove from local list and stay at same index (shows next weapon)
      setBatchSprites(prev => prev.filter((_, i) => i !== activeBatchIndex));
      // If we were at the end, step back
      setActiveBatchIndex(i => Math.min(i, batchSprites.length - 2));
      setBatchClickStep('base');
      // Refresh stats
      const stats = await fetchPipelineStats();
      setPipelineStats(stats);
    } catch (err: any) {
      setPipelineMessage(`❌ Error: ${err.message}`);
    } finally {
      setPipelineLoading(false);
    }
  };

  const handleSkipWeapon = async () => {
    const sprite = batchSprites[activeBatchIndex];
    if (!sprite) return;
    setPipelineLoading(true);
    try {
      const filename = sprite.url.split('/').pop() || '';
      const result = await skipWeapon(filename);
      setPipelineMessage(`⏭️ ${result.message}`);
      setBatchSprites(prev => prev.filter((_, i) => i !== activeBatchIndex));
      setActiveBatchIndex(i => Math.min(i, batchSprites.length - 2));
      setBatchClickStep('base');
      const stats = await fetchPipelineStats();
      setPipelineStats(stats);
    } catch (err: any) {
      setPipelineMessage(`❌ Error: ${err.message}`);
    } finally {
      setPipelineLoading(false);
    }
  };

  const handleUnanchorWeapon = async () => {
    const sprite = batchSprites[activeBatchIndex];
    if (!sprite) return;
    setPipelineLoading(true);
    try {
      const filename = sprite.url.split('/').pop() || '';
      const result = await unanchorWeapon(filename);
      setPipelineMessage(`🔓 ${result.message}`);
      setBatchSprites(prev => prev.filter((_, i) => i !== activeBatchIndex));
      setActiveBatchIndex(i => Math.min(i, Math.max(0, batchSprites.length - 2)));
      setBatchClickStep('base');
      const stats = await fetchPipelineStats();
      setPipelineStats(stats);
    } catch (err: any) {
      setPipelineMessage(`❌ Error: ${err.message}`);
    } finally {
      setPipelineLoading(false);
    }
  };

  const handleUnskipWeapon = async () => {
    const sprite = batchSprites[activeBatchIndex];
    if (!sprite) return;
    setPipelineLoading(true);
    try {
      const filename = sprite.url.split('/').pop() || '';
      const result = await unskipWeapon(filename);
      setPipelineMessage(`↩️ ${result.message}`);
      setBatchSprites(prev => prev.filter((_, i) => i !== activeBatchIndex));
      setActiveBatchIndex(i => Math.min(i, Math.max(0, batchSprites.length - 2)));
      setBatchClickStep('base');
      const stats = await fetchPipelineStats();
      setPipelineStats(stats);
    } catch (err: any) {
      setPipelineMessage(`❌ Error: ${err.message}`);
    } finally {
      setPipelineLoading(false);
    }
  };

  const advanceBatchItem = () => {
    if (activeBatchIndex < batchSprites.length - 1) {
      setActiveBatchIndex(i => i + 1);
      setBatchClickStep('base');
    }
  };

  const prevBatchItem = () => {
    if (activeBatchIndex > 0) {
      setActiveBatchIndex(i => i - 1);
      setBatchClickStep('base');
    }
  };

  const exportAllMetadata = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      frameAnchors: frameAnchorsMap,
      batchSprites: batchSprites.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        baseAnchor: s.baseAnchor,
        tipAnchor: s.tipAnchor,
        angle: s.angle,
        distance: s.distance,
        isMarked: s.isMarked
      }))
    };
    const jsonStr = exportAnchorsToJSON(data);
    downloadJSONFile('equipment_anchors_metadata.json', jsonStr);
  };

  const filteredBatchSprites = batchCategoryFilter === 'all'
    ? batchSprites
    : batchSprites.filter(s => s.category === batchCategoryFilter);

  const activeSprite = batchSprites[activeBatchIndex];

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#090d16',
      color: '#f4f4f5',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '1.5rem',
      boxSizing: 'border-box'
    }}>
      {/* APP HEADER */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        backgroundColor: '#121827',
        borderRadius: '12px',
        border: '1px solid #1f293d',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            fontSize: '1.8rem',
            padding: '0.4rem 0.8rem',
            backgroundColor: '#06b6d4',
            color: '#090d16',
            borderRadius: '8px',
            fontWeight: 900
          }}>
            ⚓
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05rem', color: '#38bdf8' }}>
              EQUIPMENT & SPRITE ANCHOR STUDIO
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              2-Point Vector Anchor Point Engine & Batch Equipment Alignment System
            </p>
          </div>
        </div>

        {/* MODE SWITCHER TABS */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#0f172a', padding: '0.3rem', borderRadius: '8px', border: '1px solid #334155' }}>
          <button
            onClick={() => setStudioMode('mode1_animation')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: studioMode === 'mode1_animation' ? '#06b6d4' : 'transparent',
              color: studioMode === 'mode1_animation' ? '#090d16' : '#cbd5e1',
              transition: 'all 0.2s ease'
            }}
          >
            🎬 MODE 1: ANIMATION ANCHOR EDITOR
          </button>
          <button
            onClick={() => setStudioMode('mode2_batch')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: studioMode === 'mode2_batch' ? '#06b6d4' : 'transparent',
              color: studioMode === 'mode2_batch' ? '#090d16' : '#cbd5e1',
              transition: 'all 0.2s ease'
            }}
          >
            📦 MODE 2: BATCH SPRITE MARKER
          </button>
        </div>

        <button
          onClick={exportAllMetadata}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: '#10b981',
            color: '#090d16',
            fontWeight: 800,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
          }}
        >
          💾 EXPORT METADATA JSON
        </button>
      </header>

      {/* ========================================================================= */}
      {/* MODE 1: CHARACTER & ANIMATION FRAME ANCHOR EDITOR */}
      {/* ========================================================================= */}
      {studioMode === 'mode1_animation' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 360px', gap: '1.5rem' }}>
          
          {/* LEFT PANEL: TIMELINE & CONTROLS */}
          <div style={{ backgroundColor: '#121827', padding: '1.2rem', borderRadius: '12px', border: '1px solid #1f293d' }}>
            <h3 style={{ margin: '0 0 0.6rem 0', color: '#38bdf8', fontSize: '1.1rem' }}>🎬 Arena Animation Editor</h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#0c1222', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <b style={{ color: '#f59e0b' }}>Slash → East</b> — 6 source frames
              <br/>Arena loop: [1,2,3,4,5,4,3,2]
            </div>

            {/* FRAME SCRUBBER */}
            <div style={{ marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Frame Scrubber</label>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>Frame {frameIndex} / {TOTAL_SLASH_FRAMES - 1}</span>
              </div>
              <input
                type="range"
                min={0}
                max={TOTAL_SLASH_FRAMES - 1}
                value={frameIndex}
                onChange={e => { setIsPlaying(false); setFrameIndex(Number(e.target.value)); }}
                style={{ width: '100%', accentColor: '#06b6d4' }}
              />
              {/* Frame step buttons */}
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                {Array.from({ length: TOTAL_SLASH_FRAMES }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => { setIsPlaying(false); setFrameIndex(i); }}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      borderRadius: '4px',
                      border: frameIndex === i ? '2px solid #06b6d4' : '1px solid #334155',
                      backgroundColor: frameIndex === i ? '#0284c7' : '#0f172a',
                      color: frameIndex === i ? '#fff' : '#64748b',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* PLAYBACK CONTROLS */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  borderRadius: '6px',
                  backgroundColor: isPlaying ? '#ef4444' : '#10b981',
                  color: '#fff',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? '⏸️ PAUSE' : '▶️ PLAY ARENA LOOP'}
              </button>
            </div>

            {/* SPEED SLIDER */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                Speed: {playbackSpeed}ms / frame
              </label>
              <input
                type="range"
                min={50}
                max={300}
                step={10}
                value={playbackSpeed}
                onChange={e => setPlaybackSpeed(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#06b6d4' }}
              />
            </div>

            {/* APPLY TO ALL FRAMES */}
            <button
              onClick={applyAnchorToAllFrames}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#0f172a',
                color: '#38bdf8',
                border: '1px solid #0284c7',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '0.8rem'
              }}
            >
              📋 Copy to All 6 Frames
            </button>

            {/* SAVE TO ARENA */}
            <button
              onClick={saveToArena}
              style={{
                width: '100%',
                padding: '0.8rem',
                backgroundColor: '#10b981',
                color: '#090d16',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 900,
                cursor: 'pointer',
                fontSize: '0.95rem',
                marginBottom: '0.5rem'
              }}
            >
              💾 SAVE TO ARENA
            </button>

            {/* REFRESH FROM ARENA */}
            <button
              onClick={loadArenaOverrides}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#0f172a',
                color: '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔄 Refresh Frames from Arena
            </button>

            {/* SAVE MESSAGE */}
            {arenaSaveMsg && (
              <div style={{ marginTop: '0.8rem', padding: '0.6rem', backgroundColor: '#0c1222', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 700, textAlign: 'center' }}>
                {arenaSaveMsg}
              </div>
            )}
          </div>

          {/* CENTER CANVAS: INTERACTIVE WORKSPACE */}
          <div style={{ backgroundColor: '#121827', padding: '1.2rem', borderRadius: '12px', border: '1px solid #1f293d', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>🎯 Grip & Orientation Editor</h3>
              <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', backgroundColor: '#0f172a', borderRadius: '4px', border: '1px solid #334155', color: clickStep === 'base' ? '#10b981' : '#38bdf8', fontWeight: 800 }}>
                {clickStep === 'base' ? '🟢 Click: Grip Point' : '🔵 Click: Orientation Tip'}
              </span>
            </div>

            {/* PLACEMENT MODE BUTTONS */}
            <div style={{ display: 'flex', gap: '0.6rem', width: '384px', marginBottom: '0.8rem' }}>
              <button
                onClick={() => setClickStep('base')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #10b981',
                  backgroundColor: clickStep === 'base' ? '#10b981' : '#0f172a',
                  color: clickStep === 'base' ? '#090d16' : '#10b981',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                📍 Grip Point
              </button>
              <button
                onClick={() => setClickStep('tip')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #06b6d4',
                  backgroundColor: clickStep === 'tip' ? '#06b6d4' : '#0f172a',
                  color: clickStep === 'tip' ? '#090d16' : '#06b6d4',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🧭 Orientation Tip
              </button>
            </div>

            {/* CANVAS */}
            <div style={{ position: 'relative', width: '384px', height: '384px', border: '2px dashed #06b6d4', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#090d16' }}>
              <div style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }}>
                <LpcCharacterCanvas
                  config={state.lpcCharacter}
                  equippedWeapon={state.equippedWeapon}
                  action={action}
                  direction={direction}
                  frame={frameIndex}
                  width={384}
                  height={384}
                />
              </div>
              <canvas
                ref={canvasRef}
                width={384}
                height={384}
                onClick={handleMode1CanvasClick}
                style={{ position: 'absolute', top: 0, left: 0, cursor: 'crosshair', zIndex: 10 }}
              />
            </div>

            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem', textAlign: 'center' }}>
              Saved anchors are used by the arena to render weapons on the player during slash-east attacks.
            </p>
          </div>

          {/* RIGHT PANEL: NUMERIC CONTROLS */}
          <div style={{ backgroundColor: '#121827', padding: '1.2rem', borderRadius: '12px', border: '1px solid #1f293d' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#38bdf8', fontSize: '1.1rem' }}>📊 Frame {frameIndex} Data</h3>

            {/* NUMERIC VECTOR CONTROLS CARD */}
            <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.9rem', color: '#10b981' }}>🟢 Grip Position (px)</h4>
              
              {/* BASE X */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.8rem', width: '50px', color: '#94a3b8' }}>Grip X:</span>
                <button onClick={() => updateBaseCoordinates(currentSpec.base.x - 1, currentSpec.base.y)} style={{ width: '28px', height: '28px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontWeight: 900, borderRadius: '4px', cursor: 'pointer' }}>-</button>
                <input
                  type="number"
                  value={currentSpec.base.x}
                  onChange={e => updateBaseCoordinates(Number(e.target.value), currentSpec.base.y)}
                  style={{ flex: 1, padding: '0.4rem', backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '4px', color: '#fff', textAlign: 'center', fontWeight: 700 }}
                />
                <button onClick={() => updateBaseCoordinates(currentSpec.base.x + 1, currentSpec.base.y)} style={{ width: '28px', height: '28px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontWeight: 900, borderRadius: '4px', cursor: 'pointer' }}>+</button>
              </div>

              {/* BASE Y */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', width: '50px', color: '#94a3b8' }}>Grip Y:</span>
                <button onClick={() => updateBaseCoordinates(currentSpec.base.x, currentSpec.base.y - 1)} style={{ width: '28px', height: '28px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontWeight: 900, borderRadius: '4px', cursor: 'pointer' }}>-</button>
                <input
                  type="number"
                  value={currentSpec.base.y}
                  onChange={e => updateBaseCoordinates(currentSpec.base.x, Number(e.target.value))}
                  style={{ flex: 1, padding: '0.4rem', backgroundColor: '#090d16', border: '1px solid #334155', borderRadius: '4px', color: '#fff', textAlign: 'center', fontWeight: 700 }}
                />
                <button onClick={() => updateBaseCoordinates(currentSpec.base.x, currentSpec.base.y + 1)} style={{ width: '28px', height: '28px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', fontWeight: 900, borderRadius: '4px', cursor: 'pointer' }}>+</button>
              </div>

              <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.9rem', color: '#38bdf8' }}>🧭 Orientation Vector</h4>

              {/* ANGLE SLIDER */}
              <div style={{ marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                  <span>Rotation Angle:</span>
                  <b style={{ color: '#38bdf8' }}>{currentSpec.angle ?? 0}°</b>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={5}
                  value={currentSpec.angle ?? 0}
                  onChange={e => updateAngleAndDistance(Number(e.target.value), currentSpec.distance || 35)}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
              </div>

              {/* FIXED DISTANCE SLIDER */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                  <span>Fixed Distance:</span>
                  <b style={{ color: '#38bdf8' }}>{currentSpec.distance ?? 35}px</b>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={1}
                  value={currentSpec.distance ?? 35}
                  onChange={e => updateAngleAndDistance(currentSpec.angle ?? 0, Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
              </div>
            </div>

            {/* ALL FRAMES OVERVIEW */}
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>All 6 Frames Status</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.3rem' }}>
                {Array.from({ length: TOTAL_SLASH_FRAMES }, (_, i) => {
                  const k = `slash_east_${i}`;
                  const hasData = !!frameAnchorsMap[k]?.[activeLabel];
                  return (
                    <div
                      key={i}
                      onClick={() => { setIsPlaying(false); setFrameIndex(i); }}
                      style={{
                        padding: '0.4rem',
                        borderRadius: '4px',
                        border: frameIndex === i ? '2px solid #06b6d4' : '1px solid #1e293b',
                        backgroundColor: hasData ? '#052e16' : '#0f172a',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: frameIndex === i ? '#06b6d4' : '#fff' }}>{i}</div>
                      <div style={{ fontSize: '0.6rem', color: hasData ? '#10b981' : '#64748b' }}>{hasData ? '\u2713 SET' : '\u2014'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: BATCH MULTI-SPRITE ANCHOR MARKER */}
      {/* ========================================================================= */}
      {studioMode === 'mode2_batch' && (
        <div>
          {/* PIPELINE STATS BAR / TAB SELECTOR */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
            {[
              { id: 'unverified', label: 'Unverified', value: pipelineStats.unverified, color: '#f59e0b', icon: '📂' },
              { id: 'anchored', label: 'Anchored', value: pipelineStats.anchored, color: '#10b981', icon: '✅' },
              { id: 'skipped', label: 'Skipped', value: pipelineStats.skipped, color: '#ef4444', icon: '⏭️' },
              { id: 'total', label: 'Total Ingestion', value: pipelineStats.total, color: '#06b6d4', icon: '📊' },
            ].map(s => {
              const isTab = s.id !== 'total';
              const isActive = pipelineTab === s.id;
              return (
                <div
                  key={s.label}
                  onClick={() => isTab && setPipelineTab(s.id as any)}
                  style={{
                    backgroundColor: isActive ? '#1e293b' : '#121827',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: isActive ? `2px solid ${s.color}` : '1px solid #1f293d',
                    textAlign: 'center',
                    cursor: isTab ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? `0 0 16px ${s.color}33` : undefined,
                    transform: isActive ? 'scale(1.02)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: isActive ? '#fff' : '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05rem' }}>
                    {s.label} {isTab && isActive ? '(VIEWING)' : ''}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PIPELINE MESSAGE TOAST */}
          {pipelineMessage && (
            <div style={{ backgroundColor: '#1e293b', padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid #334155', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0', textAlign: 'center' }}>
              {pipelineMessage}
            </div>
          )}

          {/* BATCH HEADER CONTROLS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#121827', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #1f293d', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#38bdf8' }}>
                ⚔️ {pipelineTab === 'anchored' ? 'Anchored Weapons Library' : pipelineTab === 'skipped' ? 'Skipped Weapons Folder' : 'Unverified Weapon Pipeline'}
              </h3>
              
              <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: '#0f172a', padding: '0.2rem', borderRadius: '6px', border: '1px solid #334155' }}>
                <button
                  onClick={() => setBatchViewMode('rapid')}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', backgroundColor: batchViewMode === 'rapid' ? '#06b6d4' : 'transparent', color: batchViewMode === 'rapid' ? '#090d16' : '#94a3b8', fontWeight: 800, cursor: 'pointer' }}
                >
                  🎯 ANCHOR MODE
                </button>
                <button
                  onClick={() => setBatchViewMode('grid')}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', backgroundColor: batchViewMode === 'grid' ? '#06b6d4' : 'transparent', color: batchViewMode === 'grid' ? '#090d16' : '#94a3b8', fontWeight: 800, cursor: 'pointer' }}
                >
                  🖼️ GRID PREVIEW
                </button>
              </div>

              <button
                onClick={() => loadPipelineWeapons(pipelineTab)}
                disabled={pipelineLoading}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}
              >
                🔄 Refresh
              </button>
            </div>

            <div style={{ color: pipelineTab === 'anchored' ? '#10b981' : pipelineTab === 'skipped' ? '#ef4444' : '#f59e0b', fontWeight: 800 }}>
              {pipelineLoading ? '⏳ Loading...' : `${batchSprites.length} ${pipelineTab} weapons`}
            </div>
          </div>

          {/* EMPTY STATE */}
          {!pipelineLoading && batchSprites.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#121827', borderRadius: '12px', border: '1px solid #1f293d' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ color: '#10b981', margin: '0 0 0.5rem 0' }}>No {pipelineTab} weapons!</h3>
              <p style={{ color: '#94a3b8', margin: 0 }}>
                {pipelineTab === 'unverified'
                  ? 'No unverified weapons remaining. Add new sprite PNGs to public/assets/unverified_weapons/ and click Refresh.'
                  : `No assets currently in the ${pipelineTab} folder.`}
              </p>
            </div>
          )}

          {/* VIEW MODE B: RAPID ANCHOR MODE */}
          {batchViewMode === 'rapid' && activeSprite && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
              <div style={{ backgroundColor: '#121827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1f293d', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* INSTRUCTION BANNER */}
                <div style={{ width: '100%', backgroundColor: '#0f172a', padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid #06b6d4', marginBottom: '1.2rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
                    {batchClickStep === 'base' ? '🟢 Step 1: Click where the hand GRIPS the weapon' : '🔵 Step 2: Click weapon TIP to set orientation'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    Each weapon gets <b>1 anchor point + 1 orientation</b> only. Clicking grip again resets.
                  </span>
                </div>

                {/* SPRITE INTERACTIVE CANVAS */}
                <div style={{ position: 'relative', width: '384px', height: '384px', backgroundColor: '#090d16', border: '2px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
                  <img
                    src={activeSprite.url}
                    alt={activeSprite.name}
                    style={{ width: '100%', height: '100%', imageRendering: 'pixelated' as const }}
                  />
                  <canvas
                    ref={batchCanvasRef}
                    width={384}
                    height={384}
                    onClick={handleBatchCanvasClick}
                    style={{ position: 'absolute', top: 0, left: 0, cursor: 'crosshair' }}
                  />
                </div>

                {/* ACTION BUTTONS ROW */}
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', width: '384px' }}>
                  {pipelineTab === 'unverified' && (
                    <button
                      onClick={handleSkipWeapon}
                      disabled={pipelineLoading}
                      style={{ flex: 1, padding: '0.8rem', backgroundColor: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      ⏭️ SKIP
                    </button>
                  )}
                  {pipelineTab === 'anchored' && (
                    <button
                      onClick={handleUnanchorWeapon}
                      disabled={pipelineLoading}
                      style={{ flex: 1, padding: '0.8rem', backgroundColor: '#451a03', color: '#fde047', border: '1px solid #78350f', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      🔓 UNANCHOR
                    </button>
                  )}
                  {pipelineTab === 'skipped' && (
                    <button
                      onClick={handleUnskipWeapon}
                      disabled={pipelineLoading}
                      style={{ flex: 1, padding: '0.8rem', backgroundColor: '#1e3a8a', color: '#93c5fd', border: '1px solid #1d4ed8', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      ↩️ UNSKIP
                    </button>
                  )}
                  <button
                    onClick={prevBatchItem}
                    disabled={activeBatchIndex === 0}
                    style={{ flex: 1, padding: '0.8rem', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    ◀ PREV
                  </button>
                  <button
                    onClick={advanceBatchItem}
                    disabled={activeBatchIndex >= batchSprites.length - 1}
                    style={{ flex: 1, padding: '0.8rem', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    NEXT ▶
                  </button>
                  {pipelineTab !== 'skipped' && (
                    <button
                      onClick={handleAnchorAndAdvance}
                      disabled={pipelineLoading || !activeSprite.baseAnchor || !activeSprite.tipAnchor}
                      style={{ flex: 2, padding: '0.8rem', backgroundColor: (!activeSprite.baseAnchor || !activeSprite.tipAnchor) ? '#1e293b' : '#10b981', color: (!activeSprite.baseAnchor || !activeSprite.tipAnchor) ? '#64748b' : '#090d16', border: 'none', borderRadius: '6px', fontWeight: 900, cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      {pipelineTab === 'anchored' ? '💾 UPDATE ANCHOR' : '✅ ANCHOR & SAVE'}
                    </button>
                  )}
                </div>

                {/* COUNTER */}
                <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                  Sprite {activeBatchIndex + 1} of {batchSprites.length} remaining
                </div>
              </div>

              {/* RIGHT ITEM INFO CARD */}
              <div style={{ backgroundColor: '#121827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1f293d' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#38bdf8' }}>🏷️ Weapon Info</h3>
                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.4rem 0', color: '#fff', wordBreak: 'break-all' }}>{activeSprite.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all' }}>{activeSprite.url.split('/').pop()}</p>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', color: '#10b981' }}>📊 Anchor Data</h4>
                  <div style={{ fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    <div><b style={{ color: '#10b981' }}>Grip X:</b> {activeSprite.baseAnchor?.x ?? '--'}px</div>
                    <div><b style={{ color: '#10b981' }}>Grip Y:</b> {activeSprite.baseAnchor?.y ?? '--'}px</div>
                    <div><b style={{ color: '#38bdf8' }}>Tip X:</b> {activeSprite.tipAnchor?.x ?? '--'}px</div>
                    <div><b style={{ color: '#38bdf8' }}>Tip Y:</b> {activeSprite.tipAnchor?.y ?? '--'}px</div>
                    <div><b>Angle:</b> {activeSprite.angle ?? '--'}°</div>
                    <div><b>Distance:</b> {activeSprite.distance ?? '--'}px</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#0c1222', padding: '0.8rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.8rem', color: '#f59e0b' }}>🔄 Workflow</h4>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>
                    <div>1. Click grip point (green)</div>
                    <div>2. Click weapon tip (blue)</div>
                    <div>3. Hit <b style={{ color: '#10b981' }}>ANCHOR & SAVE</b></div>
                    <div style={{ marginTop: '0.3rem', color: '#64748b' }}>• Sprite moves to <b>anchored_weapons/</b></div>
                    <div style={{ color: '#64748b' }}>• Skip moves to <b>skipped_weapons/</b></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE A: GRID PREVIEW MODE */}
          {batchViewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.6rem' }}>
              {filteredBatchSprites.map((item, idx) => (
                <div
                  key={`${item.id}_${idx}`}
                  onClick={() => { setActiveBatchIndex(idx); setBatchViewMode('rapid'); }}
                  style={{
                    backgroundColor: '#121827',
                    border: activeBatchIndex === idx ? '2px solid #06b6d4' : '1px solid #1f293d',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <img src={item.url} alt={item.name} style={{ width: '64px', height: '64px', imageRendering: 'pixelated' as const, marginBottom: '0.3rem' }} />
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#94a3b8', textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.2 }}>{item.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
