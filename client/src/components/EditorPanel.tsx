import React from 'react';
import Editor from "@monaco-editor/react";
import { EditorPanelProps } from '../types';

// 编辑器面板组件
export const EditorPanel: React.FC<EditorPanelProps> = ({ activeFile, setFileContent, theme }) => {
  if (!activeFile) return <div className="flex-1 p-2">选择一个文件</div>;

  return (
    <Editor
      height="100vh"
      theme={theme}
      defaultLanguage="javascript"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
        automaticLayout: true,
      }}
      value={activeFile.content || ""}
      onChange={(val) => setFileContent(activeFile, val || "")}
    />
  );
};

export default EditorPanel;