import React, { useState } from 'react';
import Editor from "@monaco-editor/react";
import { FileNodeProps, FileExplorerTreeProps, ActivityBarItem } from '../types';

// 文件节点组件
const FileNode: React.FC<FileNodeProps> = ({ 
  node, 
  level = 0, 
  setActiveFile, 
  addNode, 
  deleteNode, 
  renameNode,
  activeFile 
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(node.name);

  const toggleExpand = () => {
    if (node.type === "folder") setExpanded(!expanded);
  };

  const handleRename = () => {
    renameNode(node, name);
    setEditing(false);
  };

  // 检测文件是否被选中
  const isActive = node.type === "file" && activeFile && activeFile.id === node.id;

  // 根据文件扩展名选择图标
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
      case 'js':
      case 'jsx':
        return '🟨'; // JavaScript
      case 'ts':
      case 'tsx':
        return '🟦'; // TypeScript
      case 'py':
        return '🐍'; // Python
      case 'java':
        return '☕'; // Java
      case 'html':
        return '🔷'; // HTML
      case 'css':
        return '🎨'; // CSS
      case 'md':
        return '📝'; // Markdown
      default:
        return '📄'; // 默认文件
    }
  };

  return (
    <div className="file-node">
      <div 
        style={{ paddingLeft: `${level * 16}px` }} 
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
      >
        {node.type === "folder" && (
          <span 
            onClick={toggleExpand} 
            className="cursor-pointer flex-shrink-0 w-4 h-4 flex items-center justify-center"
          >
            {expanded ? '▼' : '►'}
          </span>
        )}
        {node.type === "file" && (
          <span className="flex-shrink-0">
            {getFileIcon(node.name)}
          </span>
        )}
        {node.type === "folder" && !editing && (
          <span className="flex-shrink-0">📁</span>
        )}
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
            className={`flex-grow border rounded px-1 py-0.5 ${isActive ? 'bg-blue-700 text-white' : ''}`}
            style={{ fontSize: 'inherit' }}
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            onClick={() => node.type === "file" && setActiveFile(node)}
            className={`cursor-pointer flex-grow py-0.5 ${node.type === 'file' ? 'truncate' : ''}`}
          >
            {node.name}
          </span>
        )}
        {!editing && node.type === "folder" && (
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => addNode(node, "file")} className="file-btn mr-1">+File</button>
            <button onClick={() => addNode(node, "folder")} className="file-btn mr-1">+Folder</button>
          </div>
        )}
        {!editing && (
          <button
            onClick={() => deleteNode(node)}
            className="file-btn text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        )}
      </div>
      {expanded && node.type === "folder" && node.children?.map((child) => (
        <FileNode
          key={child.id}
          node={child}
          level={level + 1}
          setActiveFile={setActiveFile}
          addNode={addNode}
          deleteNode={deleteNode}
          renameNode={renameNode}
          activeFile={activeFile}
        />
      ))}
    </div>
  );
};

// 文件浏览器树组件
export const FileExplorerTree: React.FC<FileExplorerTreeProps> = ({ 
  files, 
  setActiveFile, 
  addNode, 
  deleteNode, 
  renameNode,
  activeFile 
}) => (
  <div className="text-white dark:bg-gray-900  p-1 overflow-auto h-full text-sm">
    <div className="p-1 mb-1 font-medium text-gray-500 dark:text-gray-400">
      Explorer
    </div>
    <div className="group">
      {files.map((node) => (
        <FileNode
          key={node.id}
          node={node}
          level={0}
          setActiveFile={setActiveFile}
          addNode={addNode}
          deleteNode={deleteNode}
          renameNode={renameNode}
          activeFile={activeFile}
        />
      ))}
    </div>
  </div>
);

// Activity Bar 组件
export const ActivityBar: React.FC<{
  items: ActivityBarItem[];
  activeItemId: string;
  onItemClick: (itemId: string) => void;
  context: any;
}> = ({ items, activeItemId, onItemClick, context }) => {
  return (
    <div className="bg-gray-800 dark:bg-gray-900 w-12 flex flex-col items-center py-2 border-r border-gray-700">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className={`w-8 h-8 flex items-center justify-center rounded-md mb-1 transition-colors ${activeItemId === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
      <div className="mt-auto">
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white">
          ⚙️
        </button>
      </div>
    </div>
  );
};

// 更新EditorPanel组件
type EditorPanelProps = {
  activeFile: any;
  setFileContent: (file: any, content: string) => void;
  theme: string;
};

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