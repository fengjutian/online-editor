import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { runCode } from "./api";

type LanguageType = "javascript" | "python" | "java";

export default function App() {
  const [code, setCode] = useState<string>('// write your code here\n');
  const [language, setLanguage] = useState<LanguageType>('javascript');

  const handleRunCode = async () => {
    try {
      const data = await runCode(language, code);
      alert(data.output || data.error);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* 语言选择器 */}
      <div className="p-2 bg-gray-100 flex gap-2">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as LanguageType)}
        >
          <option value="javascript">JavaScript (Node.js)</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <button
          onClick={handleRunCode}
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