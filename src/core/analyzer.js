/**
 * 분석 엔진 — 기계적 분석 + 행동 휴리스틱
 * 모든 임계값/가중치는 config 파라미터에서 참조
 */
import { S } from './state.js';

export function analyzeHeuristics(opLog, config) {
  const C = config;
  const empty = { score: 0, detail: 'データ不足' };
  if (opLog.length < 3) return { nonlinear: empty, thinking: empty, editQuality: empty, behaviorScore: 0 };

  // (a) 비선형 편집
  let totalOps = 0, backJumps = 0, lastEnd = 0;
  for (const op of opLog) {
    if (op.inserted.length > 0 && op.pos < lastEnd - 1) backJumps++;
    lastEnd = op.pos + op.inserted.length; totalOps++;
  }
  const nlScore = Math.min(100, Math.round((totalOps > 0 ? backJumps / totalOps : 0) * C.nonlinear.scaleFactor));

  // (b) 사고 정지 (행동 연계 검증)
  let pauses = 0;
  for (let i = 1; i < opLog.length; i++) {
    const g = opLog[i].timestamp - opLog[i - 1].timestamp;
    if (g < C.thinking.minPauseMs || g >= C.thinking.maxPauseMs) continue;
    if (opLog[i].type === 'paste' || opLog[i - 1].type === 'paste') continue;
    const prevEnd = opLog[i - 1].pos + opLog[i - 1].inserted.length;
    let valid = false, checkEnd = prevEnd;
    for (let j = i; j < Math.min(i + C.thinking.lookAheadOps, opLog.length); j++) {
      const op = opLog[j];
      if (op.pos < checkEnd - 1) { valid = true; break; }
      if (op.deleted.length >= C.thinking.minDeleteForContent) { valid = true; break; }
      if (op.deleted.length > 0 && op.inserted.length >= C.thinking.minInsertForContent) { valid = true; break; }
      checkEnd = op.pos + op.inserted.length;
    }
    if (valid) pauses++;
  }
  const totalTime = opLog[opLog.length - 1].timestamp - opLog[0].timestamp;
  const thScore = Math.min(100, Math.round((totalTime > 0 ? (pauses * C.thinking.pauseWeight) / totalTime : 0) * C.thinking.scoreScale));

  // (c) 수정 패턴 질
  let typo = 0, content = 0;
  for (const op of opLog) {
    if (op.deleted.length > 0) {
      if (op.deleted.length <= C.editQuality.typoMaxLength && op.inserted.length <= C.editQuality.typoMaxLength && op.inserted.length > 0) typo++;
      else if (op.deleted.length >= C.editQuality.contentMinDelete || (op.deleted.length > 0 && op.inserted.length >= C.editQuality.contentMinInsert)) content++;
    }
  }
  const eqScore = (typo + content) > 0 ? Math.round(content / (typo + content) * 100) : 0;

  const W = C.behaviorWeights;
  const behaviorScore = Math.round(nlScore * W.nonlinear + thScore * W.thinking + eqScore * W.editQuality);
  return { nonlinear: { score: nlScore }, thinking: { score: thScore }, editQuality: { score: eqScore }, behaviorScore, _detail: { backJumps, totalOps, pauses, typo, content } };
}

export function runAnalysis(config, labels) {
  const C = config;
  const L = labels;
  const el = document.querySelector('.editor-area');
  if (!el) return null;
  const text = el.textContent;
  const meta = S.charMeta;
  if (!text.length || !meta.length) return null;

  // desync 복구
  if (text.length !== meta.length) {
    while (S.charMeta.length > text.length) S.charMeta.pop();
    while (S.charMeta.length < text.length) S.charMeta.push({ origin: 'typing', pasteId: null, timestamp: Date.now() });
    S.prevText = text;
  }

  // 붙여넣기 그룹 상태
  const pgS = {};
  S.pasteEvents.forEach(pe => {
    const rem = meta.filter(m => m.pasteId === pe.id && m.origin === 'paste').length;
    const ins = meta.filter(m => m.pasteId === pe.id && m.origin === 'typed-in-paste').length;
    const del = pe.originalText.length - rem;
    pgS[pe.id] = { originalLen: pe.originalText.length, remaining: rem, inserted: ins, deleted: del, wasEdited: ins > 0 || del > 0, originalText: pe.originalText };
  });

  // 인용 감지
  const citIds = new Set();
  const citPats = C.citation.patterns.map(p => new RegExp(p, 'i'));
  S.pasteEvents.forEach(pe => {
    let f = -1, l = -1;
    for (let i = 0; i < meta.length; i++) { if (meta[i].pasteId === pe.id) { if (f < 0) f = i; l = i; } }
    if (f < 0) return;
    const ctx = text.slice(Math.max(0, f - C.citation.contextRange), Math.min(text.length, l + C.citation.contextRange));
    if (citPats.some(p => p.test(ctx))) citIds.add(pe.id);
  });

  // 표시 유형
  const dts = meta.map(m => {
    if (m.origin === 'typing') return 'typing';
    if (m.origin === 'typed-in-paste') return 'insert-in-paste';
    if (m.origin === 'paste') {
      if (citIds.has(m.pasteId)) return 'citation';
      if (pgS[m.pasteId]?.wasEdited) return 'paste-edited';
      return 'paste-clean';
    }
    return 'typing';
  });

  // 블록 그루핑
  const blocks = []; let cur = null;
  for (let i = 0; i < text.length; i++) {
    const dt = dts[i]; const pid = meta[i].pasteId;
    if (cur && cur.dt === dt && cur.pid === pid) { cur.text += text[i]; cur.end = i; }
    else { if (cur) blocks.push(cur); cur = { dt, pid, text: text[i], start: i, end: i }; }
  }
  if (cur) blocks.push(cur);

  // 블록별 근거 (언어별 라벨 사용)
  blocks.forEach(b => {
    const len = b.text.length;
    if (b.dt === 'typing') {
      const ivs = [];
      for (let i = b.start + 1; i <= b.end && i < meta.length; i++) { const d = meta[i].timestamp - meta[i - 1].timestamp; if (d > 0 && d < C.input.maxIntervalMs) ivs.push(d); }
      const avg = ivs.length > 0 ? Math.round(ivs.reduce((a, c) => a + c, 0) / ivs.length) : 0;
      const cpm = avg > 0 ? Math.round(60000 / avg) : 0;
      b.evidence = L.evidenceTyping(len, cpm);
    } else if (b.dt === 'paste-clean') { b.evidence = L.evidencePasteClean(len); }
    else if (b.dt === 'paste-edited') { const gs = pgS[b.pid]; b.evidence = L.evidencePasteEdited(gs.originalLen, gs.remaining, gs.deleted, gs.inserted); }
    else if (b.dt === 'insert-in-paste') { b.evidence = L.evidenceInsertInPaste(len); }
    else if (b.dt === 'citation') { b.evidence = L.evidenceCitation(len); }
  });

  // 기계적 점수
  const counts = { typing: 0, 'paste-clean': 0, 'paste-edited': 0, 'insert-in-paste': 0, citation: 0 };
  dts.forEach(dt => counts[dt]++);
  const total = text.length;
  const MW = C.mechWeights;
  const w = counts.typing * MW.typing + counts['insert-in-paste'] * MW['insert-in-paste'] + counts['paste-edited'] * MW['paste-edited'] + counts.citation * MW.citation + counts['paste-clean'] * MW['paste-clean'];
  const mechScore = total > 0 ? Math.round(w / total * 100) : 0;

  // 행동 점수
  const heuristicsRaw = analyzeHeuristics(S.opLog, C);
  const behScore = heuristicsRaw.behaviorScore;
  const det = heuristicsRaw._detail;
  const heuristics = {
    nonlinear: { score: heuristicsRaw.nonlinear.score, detail: L.heuristicNonlinear(det.backJumps, det.totalOps) },
    thinking: { score: heuristicsRaw.thinking.score, detail: L.heuristicThinking(det.pauses) },
    editQuality: { score: heuristicsRaw.editQuality.score, detail: L.heuristicEditQuality(det.typo, det.content) },
    behaviorScore: behScore,
  };

  // 종합
  const FR = C.finalScoreRatio;
  const finalScore = Math.round(mechScore * FR.mechanical + behScore * FR.behavioral);
  const G = C.grades;
  let grade, gradeLabel;
  if (finalScore >= G.excellent) { grade = 'excellent'; gradeLabel = L.gradeExcellent; }
  else if (finalScore >= G.normal) { grade = 'normal'; gradeLabel = L.gradeNormal; }
  else { grade = 'reject'; gradeLabel = L.gradeReject; }

  const avgCPM = S.inputIntervals.length > 0
    ? Math.round(60000 / (S.inputIntervals.reduce((a, b) => a + b, 0) / S.inputIntervals.length)) : 0;

  return { blocks, counts, total, mechScore, behScore, finalScore, grade, gradeLabel, avgCPM, deleteCount: S.deleteCount, pgStats: pgS, pasteEditInserts: S.pasteEditInserts, pasteDeleteCount: S.pasteDeleteCount, heuristics };
}
