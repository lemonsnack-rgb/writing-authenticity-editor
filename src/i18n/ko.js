/** 한국어 라벨 */
export default {
  // 등급
  gradeExcellent: '우수',
  gradeNormal: '보통',
  gradeReject: '거절',

  // 근거 텍스트 생성 함수
  evidenceTyping: (len, cpm) => `${len}자 직접 입력, 평균 ${cpm}타/분`,
  evidencePasteClean: (len) => `${len}자 동시 유입 (수정 없음)`,
  evidencePasteEdited: (orig, rem, del, ins) => `원본 ${orig}자 → 잔존 ${rem}자 (삭제 ${del}, 추가 ${ins})`,
  evidenceInsertInPaste: (len) => `붙여넣기 영역 내 직접 ${len}자 입력`,
  evidenceCitation: (len) => `${len}자 붙여넣기, 인용/출처 표기 발견`,

  // 행동 분석
  heuristicNonlinear: (jumps, total) => `커서 역방향 이동 ${jumps}회/${total}회 (비선형 편집)`,
  heuristicThinking: (pauses) => `유효 사고 정지 ${pauses}회 (멈춤 후 수정·역방향 이동 동반)`,
  heuristicEditQuality: (typo, content) => `오타수정 ${typo}회, 내용수정 ${content}회`,
};
