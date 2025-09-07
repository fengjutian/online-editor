import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";         // 导入主应用
import "./index.css";           // 全局样式（可选）

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
