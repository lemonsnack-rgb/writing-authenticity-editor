/**
 * 설정 파일 — 모든 분석 임계값, 가중치, 등급 기준
 * 관리자 설정 페이지에서 이 값들을 UI로 조정 가능
 * localStorage에 저장된 값이 있으면 우선 사용
 */

export const DEFAULT_CONFIG = {
  mechWeights: {
    typing: 1.0,
    'insert-in-paste': 0.7,
    citation: 0.5,
    'paste-edited': 0.3,
    'paste-clean': 0.0,
  },
  behaviorWeights: {
    nonlinear: 0.4,
    thinking: 0.35,
    editQuality: 0.25,
  },
  finalScoreRatio: {
    mechanical: 0.5,
    behavioral: 0.5,
  },
  nonlinear: {
    scaleFactor: 500,
  },
  thinking: {
    minPauseMs: 2000,
    maxPauseMs: 15000,
    lookAheadOps: 3,
    minDeleteForContent: 3,
    minInsertForContent: 2,
    pauseWeight: 3000,
    scoreScale: 200,
  },
  editQuality: {
    typoMaxLength: 2,
    contentMinDelete: 2,
    contentMinInsert: 2,
  },
  grades: {
    excellent: 70,
    normal: 40,
  },
  citation: {
    contextRange: 30,
    patterns: [
      '["""]',
      'https?:\\/\\/',
      'www\\.',
      '출처', '참고', '인용', '참조',
      'source', 'ref', 'cite',
      '\\[\\d+\\]',
      '\\(.*\\d{4}\\)',
    ],
  },
  replay: {
    minDelayMs: 10,
    maxDelayMs: 500,
    speeds: [1, 2, 4, 8, 16],
  },
  input: {
    maxIntervalMs: 10000,
  },
};

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function loadConfig(storageKey = 'authenticity-editor-config') {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) return deepMerge(DEFAULT_CONFIG, JSON.parse(saved));
  } catch (e) {
    console.warn('설정 로드 실패:', e);
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config, storageKey = 'authenticity-editor-config') {
  localStorage.setItem(storageKey, JSON.stringify(config));
}
