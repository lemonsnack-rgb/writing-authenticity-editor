import React from 'react';
import ReactDOM from 'react-dom/client';
import { loadConfig } from './config.js';
import labelsJa from './i18n/ja.js';
import uiTextJa from './i18n/ui-ja.js';
import App from './ui/App.jsx';
import './styles.css';

// 일본어 전용: typoMaxLength=1, 일본어 인용 패턴
const config = loadConfig('authenticity-editor-config-jp');
if (config.editQuality.typoMaxLength === 2) config.editQuality.typoMaxLength = 1;

ReactDOM.createRoot(document.getElementById('root')).render(
  <App config={config} labels={labelsJa} uiText={uiTextJa} stateOptions={{ useCompositionBatching: true }} />
);
