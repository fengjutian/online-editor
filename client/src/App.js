import React, { useState } from "react";
import Editor from "@monaco-editor/react";

function App() {
  const [code, setCode] = useState('// write your code here\n');
  const [language, setLanguage] = useState('javascript');

  const runCode = async () => {
    const res = await fetch("http://localhost:3001/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });
    const data = await res.json();
    alert(data.output || data.error);
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* 语言选择器 */}
      <div className="p-2 bg-gray-100 flex gap-2">
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript (Node.js)</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <button
          onClick={runCode}
          style={{ padding: "5px 10px", background: "#2563eb", color: "white" }}
        >
          Run Code
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100vh"
          defaultLanguage="javascript"
          value={code}
          onChange={(value) => setCode(value || "")}
        />
      </div>
    </div>
  );
}

export default App;
