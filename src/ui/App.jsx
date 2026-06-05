import { useState, useRef, useEffect } from 'react';
import { S, notify, resetState, attachEvents } from '../core/state.js';
import { runAnalysis } from '../core/analyzer.js';
import Certificate from './Certificate.jsx';
import ReplayModal from './ReplayModal.jsx';

/**
 * 메인 앱 컴포넌트
 * @param {object} props.config - CONFIG 객체
 * @param {object} props.labels - i18n 라벨 (analyzer용)
 * @param {object} props.uiText - UI 텍스트 (Certificate용)
 * @param {object} [props.stateOptions] - { useCompositionBatching } 등
 */
export default function App({ config, labels, uiText, stateOptions = {} }) {
  const [, tick] = useState(0);
  const [view, setView] = useState('editor');
  const [showReplay, setShowReplay] = useState(false);
  const [result, setResult] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => { const fn = () => tick(n => n + 1); S.listeners.push(fn); return () => { S.listeners = S.listeners.filter(l => l !== fn); }; }, []);
  useEffect(() => { if (view === 'editor') attachEvents(editorRef.current, config, stateOptions); }, [view]);

  const handleAnalyze = () => { const r = runAnalysis(config, labels); if (r) { setResult(r); setView('cert'); } };
  const handleReset = () => { resetState(editorRef.current); setView('editor'); setResult(null); };

  const n = S.charMeta.length;
  const ts = S.inputIntervals;
  const cpm = ts.length > 0 ? Math.round(60000 / (ts.reduce((a, b) => a + b, 0) / ts.length)) : 0;
  const typN = S.charMeta.filter(m => m.origin === 'typing').length;
  const pasN = S.charMeta.filter(m => m.origin === 'paste').length;
  const edN = S.charMeta.filter(m => m.origin === 'typed-in-paste').length;
  const T = uiText;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{T.title}</h1>
        <p className="text-gray-500 mt-1 text-sm">{T.subtitle}</p>
      </header>
      {view === 'editor' && (
        <div className="fade-in">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <label className="text-sm font-semibold text-gray-600">{T.editorLabel}</label>
              <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                <span>{T.statTotal}: <strong className="text-gray-700">{n}</strong></span>
                <span>{T.statTyping}: <strong className="text-green-600">{typN}</strong></span>
                <span>{T.statPasteShort}: <strong className="text-red-500">{pasN}</strong></span>
                <span>{T.statEditShort}: <strong className="text-blue-500">{edN}</strong></span>
                <span>{T.statDelete}: <strong className="text-gray-700">{S.deleteCount}</strong></span>
                <span>{cpm}{T.cpmUnit}</span>
              </div>
            </div>
            <div ref={editorRef} className="editor-area" contentEditable suppressContentEditableWarning />
            <div className="flex gap-3 mt-2 flex-wrap text-xs text-gray-400">
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-400 mr-1"></span>{T.legendTyping}</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-400 mr-1"></span>{T.legendPaste}</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-400 mr-1"></span>{T.legendPasteEdited}</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-400 mr-1"></span>{T.legendInsertInPaste}</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></span>{T.legendCitation}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={handleAnalyze} disabled={n === 0} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md">{T.btnAnalyze}</button>
            <button onClick={handleReset} className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors">{T.btnReset}</button>
          </div>
          {T.adminLink && <div className="text-right mt-3"><a href={T.adminLink} target="_blank" className="text-xs text-gray-400 hover:text-indigo-500 transition-colors">{T.adminText} →</a></div>}
        </div>
      )}
      {view === 'cert' && result && <Certificate result={result} config={config} uiText={T} onBack={() => { if (window.confirm(T.confirmReset)) handleReset(); }} onReplay={() => setShowReplay(true)} hasOpLog={S.opLog.length > 0} />}
      {showReplay && <ReplayModal opLog={S.opLog} onClose={() => setShowReplay(false)} config={config} />}
    </div>
  );
}
