import { useState } from 'react';

export default function Admin({ defaultConfig, storageKey, backLink, uiText }) {
  const T = uiText;
  const [config, setConfig] = useState(() => {
    try { const s = localStorage.getItem(storageKey); if (s) return JSON.parse(s); } catch (e) {}
    return JSON.parse(JSON.stringify(defaultConfig));
  });
  const [msg, setMsg] = useState('');

  const sections = [
    { title: T.secMechWeights, desc: T.secMechWeightsDesc, fields: [
      { path: 'mechWeights.typing', label: T.fTyping, desc: T.fTypingDesc, step: 0.1 },
      { path: 'mechWeights.insert-in-paste', label: T.fInsertInPaste, desc: T.fInsertInPasteDesc, step: 0.1 },
      { path: 'mechWeights.citation', label: T.fCitation, desc: T.fCitationDesc, step: 0.1 },
      { path: 'mechWeights.paste-edited', label: T.fPasteEdited, desc: T.fPasteEditedDesc, step: 0.1 },
      { path: 'mechWeights.paste-clean', label: T.fPasteClean, desc: T.fPasteCleanDesc, step: 0.1 },
    ]},
    { title: T.secBehWeights, desc: T.secBehWeightsDesc, fields: [
      { path: 'behaviorWeights.nonlinear', label: T.fNonlinear, desc: T.fNonlinearDesc, step: 0.05 },
      { path: 'behaviorWeights.thinking', label: T.fThinking, desc: T.fThinkingDesc, step: 0.05 },
      { path: 'behaviorWeights.editQuality', label: T.fEditQuality, desc: T.fEditQualityDesc, step: 0.05 },
    ]},
    { title: T.secFinalRatio, desc: T.secFinalRatioDesc, fields: [
      { path: 'finalScoreRatio.mechanical', label: T.fMechRatio, step: 0.1 },
      { path: 'finalScoreRatio.behavioral', label: T.fBehRatio, step: 0.1 },
    ]},
    { title: T.secThinking, fields: [
      { path: 'thinking.minPauseMs', label: T.fMinPause, desc: T.fMinPauseDesc, step: 500 },
      { path: 'thinking.maxPauseMs', label: T.fMaxPause, desc: T.fMaxPauseDesc, step: 1000 },
      { path: 'thinking.lookAheadOps', label: T.fLookAhead, desc: T.fLookAheadDesc, step: 1 },
      { path: 'thinking.minDeleteForContent', label: T.fMinDel, desc: T.fMinDelDesc, step: 1 },
      { path: 'thinking.minInsertForContent', label: T.fMinIns, desc: T.fMinInsDesc, step: 1 },
    ]},
    { title: T.secEditQuality, fields: [
      { path: 'editQuality.typoMaxLength', label: T.fTypoMax, desc: T.fTypoMaxDesc, step: 1 },
      { path: 'editQuality.contentMinDelete', label: T.fContentDel, step: 1 },
      { path: 'editQuality.contentMinInsert', label: T.fContentIns, step: 1 },
    ]},
    { title: T.secGrades, fields: [
      { path: 'grades.excellent', label: T.fExcellent, step: 5 },
      { path: 'grades.normal', label: T.fNormal, step: 5 },
    ]},
    { title: T.secCitation, fields: [
      { path: 'citation.contextRange', label: T.fContextRange, step: 5 },
    ]},
    { title: T.secOther, fields: [
      { path: 'nonlinear.scaleFactor', label: T.fScaleFactor, step: 50 },
      { path: 'input.maxIntervalMs', label: T.fMaxInterval, step: 1000 },
      { path: 'replay.minDelayMs', label: T.fReplayMin, step: 5 },
      { path: 'replay.maxDelayMs', label: T.fReplayMax, step: 50 },
    ]},
  ];

  function getVal(obj, path) { return path.split('.').reduce((o, k) => o?.[k], obj); }
  function setVal(obj, path, val) {
    const keys = path.split('.'); const next = JSON.parse(JSON.stringify(obj));
    let o = next; for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = val; return next;
  }

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(config));
    setMsg(T.msgSaved); setTimeout(() => setMsg(''), 3000);
  };
  const handleReset = () => {
    if (confirm(T.confirmReset)) {
      localStorage.removeItem(storageKey);
      setConfig(JSON.parse(JSON.stringify(defaultConfig)));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{T.title}</h1>
        <p className="text-gray-500 text-sm mt-1">{T.subtitle}</p>
        <a href={backLink} className="text-xs text-indigo-500 hover:text-indigo-700">← {T.backText}</a>
      </header>
      {sections.map((sec, si) => (
        <div key={si} className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 mb-1">{sec.title}</h2>
          {sec.desc && <p className="text-xs text-gray-400 mb-3">{sec.desc}</p>}
          {sec.fields.map((f, fi) => (
            <div key={fi} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div><div className="text-sm text-gray-700">{f.label}</div>{f.desc && <div className="text-xs text-gray-400 mt-0.5">{f.desc}</div>}</div>
              <input type="number" value={getVal(config, f.path)} step={f.step || 1} onChange={e => setConfig(setVal(config, f.path, parseFloat(e.target.value)))} className="w-20 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          ))}
        </div>
      ))}
      <div className="flex gap-3 justify-center mt-6 mb-4">
        <button onClick={handleSave} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md">{T.btnSave}</button>
        <button onClick={handleReset} className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors">{T.btnReset}</button>
      </div>
      {msg && <p className="text-center text-sm text-green-600">{msg}</p>}
    </div>
  );
}
