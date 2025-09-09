import React, { useState, memo } from 'react';
import { FileNodeProps } from '../types';

// 使用memo包装组件以优化性能
const FileNode = memo<FileNodeProps>(({ 
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
});

export default FileNode;