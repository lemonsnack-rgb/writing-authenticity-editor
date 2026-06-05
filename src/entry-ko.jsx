import React from 'react';
import ReactDOM from 'react-dom/client';
import { loadConfig } from './config.js';
import labelsKo from './i18n/ko.js';
import uiTextKo from './i18n/ui-ko.js';
import App from './ui/App.jsx';
import LoginGate from './ui/LoginGate.jsx';
import './styles.css';

const config = loadConfig('authenticity-editor-config');

ReactDOM.createRoot(document.getElementById('root')).render(
  <LoginGate title="작성 진정성 인증 에디터">
    <App config={config} labels={labelsKo} uiText={uiTextKo} />
  </LoginGate>
);
