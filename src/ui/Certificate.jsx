import { useState } from 'react';

export default function Certificate({ result, onBack, onReplay, hasOpLog, config, uiText }) {
  const [hovered, setHovered] = useState(null);
  const { blocks, counts, total, mechScore, behScore, finalScore, grade, gradeLabel, avgCPM, deleteCount, pgStats, pasteEditInserts, pasteDeleteCount, heuristics } = result;
  const T = uiText;
  const gc = grade === 'excellent' ? 'grade-excellent' : grade === 'normal' ? 'grade-normal' : 'grade-reject';
  const dtL = dt => T.displayTypes[dt] || dt;
  const dtC = dt => ({ typing: 'hl-typing', 'paste-clean': 'hl-paste', 'paste-edited': 'hl-paste-edited', 'insert-in-paste': 'hl-insert-in-paste', citation: 'hl-citation' })[dt] || '';
  const dtB = dt => ({ typing: 'bg-green-100 text-green-800', 'paste-clean': 'bg-red-100 text-red-800', 'paste-edited': 'bg-orange-100 text-orange-800', 'insert-in-paste': 'bg-blue-100 text-blue-800', citation: 'bg-yellow-100 text-yellow-800' })[dt] || 'bg-gray-100';

  return (
    <div className="fade-in">
      {/* 등급 헤더 */}
      <div className={gc + ' rounded-xl p-8 text-white text-center mb-6 shadow-xl'}>
        <div className="text-sm uppercase tracking-widest opacity-80 mb-2">{T.certTitle}</div>
        <div className="text-6xl font-bold mb-2">{finalScore}<span className="text-3xl">{T.pointUnit}</span></div>
        <div className="text-2xl font-semibold">{T.gradeLabel}: {gradeLabel}</div>
        <div className="text-sm opacity-80 mt-2">{T.gradeDesc[grade]}</div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          { v: total, l: T.statTotal, c: 'text-gray-800' },
          { v: counts.typing, l: T.statTyping, c: 'text-green-600' },
          { v: counts['paste-clean'], l: T.statPasteClean, c: 'text-red-500' },
          { v: counts['paste-edited'], l: T.statPasteEdited, c: 'text-orange-500' },
          { v: counts['insert-in-paste'], l: T.statInsertInPaste, c: 'text-blue-500' },
          { v: counts.citation, l: T.statCitation, c: 'text-yellow-500' },
        ].map((s, i) => (
          <div key={i} className="stat-card bg-white rounded-lg p-3 shadow text-center"><div className={'text-xl font-bold ' + s.c}>{s.v}</div><div className="text-xs text-gray-500">{s.l}</div></div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="stat-card bg-white rounded-lg p-3 shadow text-center"><div className="text-xl font-bold text-indigo-600">{avgCPM}<span className="text-sm">{T.cpmUnit}</span></div><div className="text-xs text-gray-500">{T.statSpeed}</div></div>
        <div className="stat-card bg-white rounded-lg p-3 shadow text-center"><div className="text-xl font-bold text-gray-600">{deleteCount}</div><div className="text-xs text-gray-500">{T.statDelete}</div></div>
        <div className="stat-card bg-white rounded-lg p-3 shadow text-center"><div className="text-xl font-bold text-orange-600">{pasteDeleteCount}</div><div className="text-xs text-gray-500">{T.statPasteDelete}</div></div>
        <div className="stat-card bg-white rounded-lg p-3 shadow text-center"><div className="text-xl font-bold text-blue-600">{pasteEditInserts}</div><div className="text-xs text-gray-500">{T.statPasteInsert}</div></div>
      </div>

      {/* 비율 바 */}
      <div className="bg-white rounded-lg p-4 shadow mb-6">
        <div className="text-sm font-semibold text-gray-600 mb-2">{T.ratioTitle}</div>
        <div className="flex h-6 rounded-full overflow-hidden bg-gray-100">
          {[['typing', 'bg-green-400'], ['paste-clean', 'bg-red-400'], ['paste-edited', 'bg-orange-400'], ['insert-in-paste', 'bg-blue-400'], ['citation', 'bg-yellow-400']].map(([k, bg]) =>
            counts[k] > 0 && <div key={k} className={bg + ' flex items-center justify-center text-xs text-white font-bold'} style={{ width: (counts[k] / total * 100) + '%' }}>{Math.round(counts[k] / total * 100)}%</div>
          )}
        </div>
      </div>

      {/* 종합 점수 구성 */}
      <div className="bg-white rounded-lg p-4 shadow mb-6">
        <div className="text-sm font-semibold text-gray-600 mb-3">{T.scoreCompTitle}</div>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="border rounded-lg p-3 text-center"><div className="text-xs text-gray-500 mb-1">{T.mechLabel} ({Math.round(config.finalScoreRatio.mechanical * 100)}%)</div><div className="text-2xl font-bold text-indigo-600">{mechScore}<span className="text-sm">{T.pointUnit}</span></div></div>
          <div className="border rounded-lg p-3 text-center"><div className="text-xs text-gray-500 mb-1">{T.behLabel} ({Math.round(config.finalScoreRatio.behavioral * 100)}%)</div><div className="text-2xl font-bold text-green-600">{behScore}<span className="text-sm">{T.pointUnit}</span></div></div>
        </div>
      </div>

      {/* 행동 분석 상세 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="text-sm font-semibold text-gray-600 mb-3">{T.behDetailTitle}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: T.sigNonlinear, icon: '↩', data: heuristics.nonlinear, desc: T.sigNonlinearDesc, weight: Math.round(config.behaviorWeights.nonlinear * 100) + '%' },
            { label: T.sigThinking, icon: '⏸', data: heuristics.thinking, desc: T.sigThinkingDesc, weight: Math.round(config.behaviorWeights.thinking * 100) + '%' },
            { label: T.sigEditQuality, icon: '✎', data: heuristics.editQuality, desc: T.sigEditQualityDesc, weight: Math.round(config.behaviorWeights.editQuality * 100) + '%' },
          ].map((item, i) => (
            <div key={i} className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">{item.icon} {item.label} <span className="text-xs font-normal text-gray-400">({item.weight})</span></span>
                <span className={'text-lg font-bold ' + (item.data.score >= 60 ? 'text-green-600' : item.data.score >= 30 ? 'text-yellow-600' : 'text-red-500')}>{item.data.score}<span className="text-xs">{T.pointUnit}</span></span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full mb-2"><div className={'h-full rounded-full ' + (item.data.score >= 60 ? 'bg-green-400' : item.data.score >= 30 ? 'bg-yellow-400' : 'bg-red-400')} style={{ width: item.data.score + '%' }}></div></div>
              <div className="text-xs text-gray-600">{item.data.detail}</div>
              <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 본문 분석 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="text-sm font-semibold text-gray-600 mb-3">{T.bodyAnalysisTitle}</div>
        <div className="text-base leading-8 text-gray-800" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflowWrap: 'break-word' }}>
          {blocks.map((b, i) => (
            <span key={i} className={dtC(b.dt) + ' tt'} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              {b.text}
              {hovered === i && <span className="tt-box"><strong>{dtL(b.dt)}</strong><br />{T.tooltipEvidence}: {b.evidence}<br />{T.tooltipRange}: {b.text.length}{T.charUnit} ({b.start}~{b.end})</span>}
            </span>
          ))}
        </div>
      </div>

      {/* 붙여넣기 이벤트별 수정 내역 */}
      {Object.keys(pgStats).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-sm font-semibold text-gray-600 mb-3">{T.pasteHistoryTitle}</div>
          <div className="space-y-3">{Object.entries(pgStats).map(([id, gs]) => (
            <div key={id} className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className={gs.wasEdited ? 'bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold' : 'bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-semibold'}>{gs.wasEdited ? T.pasteEdited : T.pasteKept}</span>
                <span className="text-xs text-gray-400">{T.pasteOriginal} {gs.originalLen}{T.charUnit}</span>
              </div>
              <div className="text-xs text-gray-500 truncate">{T.pasteOriginal}: {T.quote[0]}{gs.originalText.slice(0, 60)}{gs.originalText.length > 60 ? '...' : ''}{T.quote[1]}</div>
              {gs.wasEdited && <div className="text-xs text-gray-600 mt-1">{T.pasteRemaining}: <strong>{gs.remaining}{T.charUnit}</strong>{gs.deleted > 0 && <span className="text-red-500 ml-2">{T.pasteDeleted}: {gs.deleted}{T.charUnit}</span>}{gs.inserted > 0 && <span className="text-blue-500 ml-2">{T.pasteInserted}: {gs.inserted}{T.charUnit}</span>}</div>}
            </div>
          ))}</div>
        </div>
      )}

      {/* 블록 상세 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="text-sm font-semibold text-gray-600 mb-3">{T.blockDetailTitle}</div>
        <div className="space-y-2 max-h-64 overflow-y-auto">{blocks.map((b, i) => {
          const tr = b.text.length > 40 ? b.text.slice(0, 40) + '...' : b.text;
          return (
            <div key={i} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
              <span className={dtB(b.dt) + ' text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap'}>{dtL(b.dt)}</span>
              <div className="flex-1 min-w-0"><div className="text-sm text-gray-700 truncate">{tr}</div><div className="text-xs text-gray-400 mt-1">{b.evidence}</div></div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{b.text.length}{T.charUnit}</span>
            </div>
          );
        })}</div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-3 justify-center">
        {hasOpLog && <button onClick={onReplay} className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md">{T.btnReplay}</button>}
        <button onClick={onBack} className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-200 transition-colors">{T.btnBack}</button>
      </div>
    </div>
  );
}
