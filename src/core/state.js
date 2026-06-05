/**
 * 전역 상태 관리 + 이벤트 핸들러
 * charMeta[i] = { origin: 'typing'|'paste'|'typed-in-paste', pasteId, timestamp }
 */
import { simpleDiff } from '../utils/diff.js';

export const S = {
  charMeta: [],
  prevText: '',
  pasteEvents: [],
  nextPasteId: 1,
  deleteCount: 0,
  pasteDeleteCount: 0,
  pasteEditInserts: 0,
  inputIntervals: [],
  lastInputTime: null,
  listeners: [],
  opLog: [],
  startTime: null,
};

export function notify() { S.listeners.forEach(f => f()); }

export function resetState(editorEl) {
  S.charMeta = []; S.prevText = ''; S.pasteEvents = []; S.nextPasteId = 1;
  S.deleteCount = 0; S.pasteDeleteCount = 0; S.pasteEditInserts = 0;
  S.inputIntervals = []; S.lastInputTime = null; S.opLog = []; S.startTime = null;
  if (editorEl) editorEl.textContent = '';
  notify();
}

/**
 * contentEditable 요소에 이벤트 리스너 등록
 * @param {HTMLElement} el
 * @param {object} config - CONFIG 객체
 * @param {object} [options] - { useCompositionBatching: false } 일본어 등 IME 배칭
 */
export function attachEvents(el, config, options = {}) {
  if (!el || el._bound) return;
  el._bound = true;
  const useCompBatch = options.useCompositionBatching || false;

  // ★ IME 조합 배칭 (일본어용)
  let composing = false;
  let compStartText = '';

  if (useCompBatch) {
    el.addEventListener('compositionstart', () => {
      composing = true;
      compStartText = el.textContent;
    });
    el.addEventListener('compositionend', () => {
      composing = false;
      const now = Date.now();
      if (!S.startTime) S.startTime = now;
      const cur = el.textContent;
      const d = simpleDiff(compStartText, cur);
      if (!d) { S.prevText = cur; return; }
      if (d.deleted.length > 0) {
        for (let i = d.pos; i < d.pos + d.deleted.length && i < S.charMeta.length; i++) {
          if (S.charMeta[i]?.origin === 'paste' || S.charMeta[i]?.origin === 'typed-in-paste') S.pasteDeleteCount++;
        }
        S.deleteCount += d.deleted.length;
        S.charMeta.splice(d.pos, d.deleted.length);
      }
      if (d.inserted.length > 0) {
        const before = d.pos > 0 ? S.charMeta[d.pos - 1] : null;
        const after = d.pos < S.charMeta.length ? S.charMeta[d.pos] : null;
        const inP = before && after &&
          (before.origin === 'paste' || before.origin === 'typed-in-paste') &&
          (after.origin === 'paste' || after.origin === 'typed-in-paste') &&
          before.pasteId != null && before.pasteId === after.pasteId;
        const entries = [];
        for (let i = 0; i < d.inserted.length; i++) entries.push({ origin: inP ? 'typed-in-paste' : 'typing', pasteId: inP ? before.pasteId : null, timestamp: now });
        S.charMeta.splice(d.pos, 0, ...entries);
        if (inP) S.pasteEditInserts += d.inserted.length;
        if (S.lastInputTime) { const iv = now - S.lastInputTime; if (iv > 0 && iv < config.input.maxIntervalMs) S.inputIntervals.push(iv); }
        S.lastInputTime = now;
      }
      const logType = d.deleted.length > 0 ? (d.inserted.length > 0 ? 'replace' : 'delete') : 'insert';
      S.opLog.push({ type: logType, pos: d.pos, deleted: d.deleted, inserted: d.inserted, timestamp: now });
      if (S.charMeta.length !== cur.length) { while (S.charMeta.length > cur.length) S.charMeta.pop(); while (S.charMeta.length < cur.length) S.charMeta.push({ origin: 'typing', pasteId: null, timestamp: now }); }
      S.prevText = cur;
      notify();
    });
  }

  // 붙여넣기
  el.addEventListener('paste', e => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    const now = Date.now();
    if (!S.startTime) S.startTime = now;
    const tb = el.textContent;
    const sel = window.getSelection();
    if (sel.rangeCount) { const r = sel.getRangeAt(0); r.deleteContents(); const nd = document.createTextNode(text); r.insertNode(nd); r.setStartAfter(nd); r.collapse(true); sel.removeAllRanges(); sel.addRange(r); }
    const ta = el.textContent;
    const d = simpleDiff(tb, ta);
    if (!d) return;
    if (d.deleted.length > 0) { for (let i = d.pos; i < d.pos + d.deleted.length && i < S.charMeta.length; i++) { if (S.charMeta[i]?.origin === 'paste') S.pasteDeleteCount++; } S.charMeta.splice(d.pos, d.deleted.length); }
    const id = S.nextPasteId++;
    S.pasteEvents.push({ id, originalText: text, timestamp: now });
    const entries = [];
    for (let i = 0; i < d.inserted.length; i++) entries.push({ origin: 'paste', pasteId: id, timestamp: now });
    S.charMeta.splice(d.pos, 0, ...entries);
    S.opLog.push({ type: 'paste', pos: d.pos, deleted: d.deleted, inserted: d.inserted, timestamp: now, pasteId: id });
    S.prevText = ta;
    notify();
  });

  // 일반 입력
  el.addEventListener('input', e => {
    if (useCompBatch && composing) return; // IME 조합 중이면 스킵
    const cur = el.textContent;
    if (cur === S.prevText) return;
    const now = Date.now();
    if (!S.startTime) S.startTime = now;
    const d = simpleDiff(S.prevText, cur);
    if (!d) { S.prevText = cur; return; }
    let logType = 'insert';
    if (d.deleted.length > 0) {
      for (let i = d.pos; i < d.pos + d.deleted.length && i < S.charMeta.length; i++) { if (S.charMeta[i]?.origin === 'paste' || S.charMeta[i]?.origin === 'typed-in-paste') S.pasteDeleteCount++; }
      S.deleteCount += d.deleted.length; S.charMeta.splice(d.pos, d.deleted.length);
      logType = d.inserted.length > 0 ? 'replace' : 'delete';
    }
    if (d.inserted.length > 0) {
      const before = d.pos > 0 ? S.charMeta[d.pos - 1] : null;
      const after = d.pos < S.charMeta.length ? S.charMeta[d.pos] : null;
      const inP = before && after && (before.origin === 'paste' || before.origin === 'typed-in-paste') && (after.origin === 'paste' || after.origin === 'typed-in-paste') && before.pasteId != null && before.pasteId === after.pasteId;
      const entries = [];
      for (let i = 0; i < d.inserted.length; i++) entries.push({ origin: inP ? 'typed-in-paste' : 'typing', pasteId: inP ? before.pasteId : null, timestamp: now });
      S.charMeta.splice(d.pos, 0, ...entries);
      if (inP) S.pasteEditInserts += d.inserted.length;
      if (S.lastInputTime) { const iv = now - S.lastInputTime; if (iv > 0 && iv < config.input.maxIntervalMs) S.inputIntervals.push(iv); }
      S.lastInputTime = now;
    }
    S.opLog.push({ type: logType, pos: d.pos, deleted: d.deleted, inserted: d.inserted, timestamp: now });
    if (S.charMeta.length !== cur.length) { while (S.charMeta.length > cur.length) S.charMeta.pop(); while (S.charMeta.length < cur.length) S.charMeta.push({ origin: 'typing', pasteId: null, timestamp: now }); }
    S.prevText = cur;
    notify();
  });
}
