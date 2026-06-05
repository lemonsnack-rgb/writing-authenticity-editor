import { useState, useRef, useEffect, useCallback } from 'react';

export default function ReplayPlayer({ opLog, onClose, config }) {
  const C = config.replay;
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(4);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [replayText, setReplayText] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [lastOpType, setLastOpType] = useState(null);
  const [lastPasteLen, setLastPasteLen] = useState(0);
  const timerRef = useRef(null);
  const textRef = useRef('');
  const idxRef = useRef(0);
  const cursorElRef = useRef(null);
  const totalOps = opLog.length;
  const totalTime = totalOps > 0 ? opLog[totalOps - 1].timestamp - opLog[0].timestamp : 0;

  const buildTextUpTo = useCallback((idx) => {
    let t = '', pos = 0;
    for (let i = 0; i <= idx && i < opLog.length; i++) {
      const op = opLog[i];
      if (op.deleted.length > 0) t = t.slice(0, op.pos) + t.slice(op.pos + op.deleted.length);
      if (op.inserted.length > 0) t = t.slice(0, op.pos) + op.inserted + t.slice(op.pos);
      pos = op.pos + op.inserted.length;
    }
    return { text: t, cursorPos: pos };
  }, [opLog]);

  const step = useCallback(() => {
    if (idxRef.current >= totalOps) { setPlaying(false); return; }
    const op = opLog[idxRef.current];
    let t = textRef.current;
    if (op.deleted.length > 0) t = t.slice(0, op.pos) + t.slice(op.pos + op.deleted.length);
    if (op.inserted.length > 0) t = t.slice(0, op.pos) + op.inserted + t.slice(op.pos);
    textRef.current = t;
    setReplayText(t); setCursorPos(op.pos + op.inserted.length);
    setLastOpType(op.type); setLastPasteLen(op.type === 'paste' ? op.inserted.length : 0);
    idxRef.current++; setCurrentIdx(idxRef.current);
  }, [opLog, totalOps]);

  useEffect(() => {
    if (!playing) return;
    const run = () => {
      if (idxRef.current >= totalOps) { setPlaying(false); return; }
      step();
      if (idxRef.current < totalOps) {
        const cur = opLog[idxRef.current - 1]; const next = opLog[idxRef.current];
        let delay = (next.timestamp - cur.timestamp) / speed;
        delay = Math.max(C.minDelayMs, Math.min(delay, C.maxDelayMs));
        timerRef.current = setTimeout(run, delay);
      }
    };
    run();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, speed, step, opLog, totalOps]);

  useEffect(() => { if (cursorElRef.current) cursorElRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); }, [cursorPos, currentIdx]);

  const handlePlayPause = () => { if (currentIdx >= totalOps) { idxRef.current = 0; setCurrentIdx(0); textRef.current = ''; setReplayText(''); setCursorPos(0); } setPlaying(!playing); };
  const handleReset = () => { setPlaying(false); if (timerRef.current) clearTimeout(timerRef.current); idxRef.current = 0; setCurrentIdx(0); textRef.current = ''; setReplayText(''); setCursorPos(0); setLastOpType(null); };
  const handleSeek = (e) => { const rect = e.currentTarget.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width; const idx = Math.round(pct * totalOps); setPlaying(false); if (timerRef.current) clearTimeout(timerRef.current); const { text, cursorPos: cp } = buildTextUpTo(idx - 1); textRef.current = text; setReplayText(text); setCursorPos(cp); idxRef.current = idx; setCurrentIdx(idx); };

  const renderText = () => {
    const t = replayText; const pos = Math.min(cursorPos, t.length);
    const before = t.slice(0, pos); const after = t.slice(pos);
    if (lastOpType === 'paste' && lastPasteLen > 0) {
      const pStart = pos - lastPasteLen; const bp = t.slice(0, Math.max(0, pStart)); const pt = t.slice(Math.max(0, pStart), pos);
      return <>{bp}<span className="paste-flash" style={{ background: 'rgba(239,68,68,.15)' }}>{pt}</span><span ref={cursorElRef} className="cursor-blink"></span>{after}</>;
    }
    return <>{before}<span ref={cursorElRef} className="cursor-blink"></span>{after}</>;
  };

  const elapsed = currentIdx > 0 && currentIdx <= totalOps ? opLog[currentIdx - 1].timestamp - opLog[0].timestamp : 0;
  const pct = totalOps > 0 ? (currentIdx / totalOps * 100) : 0;

  return (
    <div>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-600">Replay</label>
            {lastOpType && <span className={'op-tag ' + (lastOpType === 'paste' ? 'bg-red-100 text-red-700' : lastOpType === 'delete' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700')}>{lastOpType}</span>}
          </div>
          <div className="text-xs text-gray-400"><span>{currentIdx}/{totalOps}</span><span className="ml-3">{(elapsed / 1000).toFixed(1)}s / {(totalTime / 1000).toFixed(1)}s</span></div>
        </div>
        <div className="replay-area">{replayText.length === 0 && currentIdx === 0 ? <span className="text-gray-300">▶</span> : renderText()}</div>
        <div className="replay-controls">
          <button onClick={handlePlayPause} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm">{playing ? '⏸' : currentIdx >= totalOps ? '⟳' : '▶'}</button>
          <button onClick={handleReset} className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200">⏮</button>
          <div className="progress-track" onClick={handleSeek}><div className="progress-fill" style={{ width: pct + '%' }}></div></div>
          {C.speeds.map(s => (<button key={s} onClick={() => setSpeed(s)} className={'speed-btn' + (speed === s ? ' active' : '')}>{s}x</button>))}
        </div>
      </div>
      <div className="text-center"><button onClick={onClose} className="px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-200 transition-colors">Close</button></div>
    </div>
  );
}
