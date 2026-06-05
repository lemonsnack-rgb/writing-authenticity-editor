import React from 'react';
import ReactDOM from 'react-dom/client';
import { DEFAULT_CONFIG } from './config.js';
import adminTextJa from './i18n/admin-ja.js';
import Admin from './ui/Admin.jsx';
import './styles.css';

// 일본어 기본값 오버라이드
const jpConfig = { ...DEFAULT_CONFIG, editQuality: { ...DEFAULT_CONFIG.editQuality, typoMaxLength: 1 } };

ReactDOM.createRoot(document.getElementById('root')).render(
  <Admin defaultConfig={jpConfig} storageKey="authenticity-editor-config-jp" backLink="index-jp.html" uiText={adminTextJa} />
);
