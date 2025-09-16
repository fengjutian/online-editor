import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 如果在 Electron 环境中，添加一些特定的处理
if (window.electronAPI) {
  // 这里可以添加 Electron 特有的逻辑
  console.log('Running in Electron environment');
}