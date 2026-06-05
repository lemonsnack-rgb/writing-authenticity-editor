import React from 'react';
import ReactDOM from 'react-dom/client';
import { DEFAULT_CONFIG } from './config.js';
import adminTextKo from './i18n/admin-ko.js';
import Admin from './ui/Admin.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Admin defaultConfig={DEFAULT_CONFIG} storageKey="authenticity-editor-config" backLink="index.html" uiText={adminTextKo} />
);
