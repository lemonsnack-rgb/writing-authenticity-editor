/**
 * 일본어 버전 설정 — 한국어 기본 설정에서 차이 나는 부분만 오버라이드
 */
import { DEFAULT_CONFIG, loadConfig as _loadConfig, saveConfig as _saveConfig } from './config.js';

// 일본어 전용 오버라이드
const JP_OVERRIDES = {
  editQuality: {
    typoMaxLength: 1, // 일본어: 한자 2자 교체는 내용수정
  },
  citation: {
    patterns: [
      '[「」『』"""]',
      'https?:\\/\\/',
      'www\\.',
      '参考', '引用', '出典', '出所',
      'source', 'ref', 'cite',
      '\\[\\d+\\]',
      '\\(.*\\d{4}\\)',
    ],
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

export const DEFAULT_CONFIG_JP = deepMerge(DEFAULT_CONFIG, JP_OVERRIDES);

export function loadConfigJP() {
  return _loadConfig('authenticity-editor-config-jp');
}

export function saveConfigJP(config) {
  _saveConfig(config, 'authenticity-editor-config-jp');
}
