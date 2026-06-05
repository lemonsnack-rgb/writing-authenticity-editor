/**
 * 텍스트 diff 유틸리티
 * 공통 접두사/접미사를 제거하여 변경 위치와 내용을 추출
 */
export function simpleDiff(oldStr, newStr) {
  if (oldStr === newStr) return null;
  let pre = 0;
  const min = Math.min(oldStr.length, newStr.length);
  while (pre < min && oldStr[pre] === newStr[pre]) pre++;
  let oS = 0, nS = 0;
  while (
    oS < oldStr.length - pre &&
    nS < newStr.length - pre &&
    oldStr[oldStr.length - 1 - oS] === newStr[newStr.length - 1 - nS]
  ) { oS++; nS++; }
  return {
    pos: pre,
    deleted: oldStr.slice(pre, oldStr.length - oS),
    inserted: newStr.slice(pre, newStr.length - nS),
  };
}
