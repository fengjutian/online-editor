import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

type FileNodeType = {
  id: string; // 唯一 ID
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNodeType[];
};

type ConsoleLog = { type: "stdout" | "error" | "info"; text: string };

interface FileNodeProps {
  node: FileNodeType;
  level?: number;
  setActiveFile: (file: FileNodeType) => void;
  addNode: (parent: FileNodeType, type: "file" | "folder") => void;
  deleteNode: (node: FileNodeType) => void;
  renameNode: (node: FileNodeType, newName: string) => void;
  activeFile: FileNodeType | null; // 添加这个属性
}

// 更新 FileNode 组件，添加 VSCode 风格样式
const FileNode: React.FC<FileNodeProps> = ({ 
  node, 
  level = 0, 
  setActiveFile, 
  addNode, 
  deleteNode, 
  renameNode,
  activeFile // 接收 activeFile 属性
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
          activeFile={activeFile} // 递归调用时传递 activeFile
        />
      ))}
    </div>
  );
};

interface FileExplorerTreeProps {
  files: FileNodeType[];
  setActiveFile: (file: FileNodeType) => void;
  addNode: (parent: FileNodeType, type: "file" | "folder") => void;
  deleteNode: (node: FileNodeType) => void;
  renameNode: (node: FileNodeType, newName: string) => void;
  activeFile: FileNodeType | null; // 添加这个属性
}

const FileExplorerTree: React.FC<FileExplorerTreeProps> = ({ 
  files, 
  setActiveFile, 
  addNode, 
  deleteNode, 
  renameNode,
  activeFile // 接收这个属性
}) => (
  <div className="bg-gray-100 dark:bg-gray-900 w-64 p-1 overflow-auto h-full text-sm">
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
          activeFile={activeFile} // 传递给 FileNode
        />
      ))}
    </div>
  </div>
);

interface EditorPanelProps {
  activeFile: FileNodeType | null;
  setFileContent: (file: FileNodeType, content: string) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ activeFile, setFileContent }) => {
  if (!activeFile) return <div className="flex-1 p-2">Select a file</div>;
  return (
    <Editor
      height="100vh"
      defaultLanguage="javascript"
      value={activeFile.content}
      onChange={(val) => setFileContent(activeFile, val || "")}
    />
  );
};

const App: React.FC = () => {
  const [files, setFiles] = useState<FileNodeType[]>([
    { id: "1", name: "src", type: "folder", children: [{ id: "2", name: "main.js", type: "file", content: "// JS code" }] },
    { id: "3", name: "README.md", type: "file", content: "# Project" },
  ]);

  const [activeFile, setActiveFile] = useState<FileNodeType | null>(null);
  const [language, setLanguage] = useState<string>("javascript");
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [input, setInput] = useState<string>("");

  const consoleRef = useRef<HTMLDivElement | null>(null);

  const [leftWidth, setLeftWidth] = useState<number>(20);
  const [centerWidth, setCenterWidth] = useState<number>(50);
  const [rightWidth, setRightWidth] = useState<number>(30);
  const dragInfo = useRef<{ dragging: boolean; bar: "left" | "center" | null }>({ dragging: false, bar: null });

  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [consoleLogs]);

  const updateTree = (nodes: FileNodeType[], target: FileNodeType, updater: (n: FileNodeType) => FileNodeType | null): FileNodeType[] =>
    nodes.flatMap((n) => {
      if (n === target) {
        const updated = updater(n);
        return updated ? [updated] : [];
      }
      if (n.type === "folder") return [{ ...n, children: updateTree(n.children || [], target, updater) }];
      return [n];
    });

    const setFileContent = (file: FileNodeType, content: string) => {
      // 更新 files 状态
      setFiles((prev) => updateTree(prev, file, (n) => ({ ...n, content })));
      
      // 同时更新 activeFile 状态，如果当前正在编辑的文件就是 activeFile
      if (activeFile && activeFile.id === file.id) {
        setActiveFile({ ...file, content });
      }
    };

  const addNode = (parent: FileNodeType, type: "file" | "folder") => {
    const newNode: FileNodeType = {
      id: Date.now().toString(),
      name: type === "file" ? "newFile.js" : "newFolder",
      type,
      content: type === "file" ? "" : undefined,
      children: type === "folder" ? [] : undefined,
    };
    setFiles((prev) => updateTree(prev, parent, (n) => ({ ...n, children: [...(n.children || []), newNode] })));
  };

  const deleteNode = (node: FileNodeType) => {
    if (node.type === "folder" && node.children && node.children.length > 0) {
      if (!window.confirm(`Delete folder "${node.name}" and all its contents?`)) return;
    }
    const removeNode = (nodes: FileNodeType[]): FileNodeType[] =>
      nodes.flatMap((n) => {
        if (n === node) return [];
        if (n.type === "folder") return [{ ...n, children: removeNode(n.children || []) }];
        return [n];
      });
    setFiles(removeNode(files));
    if (activeFile === node) setActiveFile(null);
  };

  const renameNode = (node: FileNodeType, newName: string) => {
    setFiles((prev) => updateTree(prev, node, (n) => ({ ...n, name: newName })));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim() !== "") runCode(input);
      setInput("");
    }
  };
  
const runCode = async (runInput?: string) => {
  console.log(1234, runInput)

  if (!activeFile) return;
  
  // 优先使用 runInput，如果没有则使用 activeFile.content
  const codeContent = runInput || activeFile.content || "";
  console.log(123456, codeContent)

  const payload = { code: codeContent, language };
  
  setConsoleLogs((prev) => [...prev, { type: "info", text: runInput ? `> ${runInput}` : `⏳ Running ${language} code...` }]);
  try {
    const res = await fetch("http://localhost:3001/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setConsoleLogs((prev) => [...prev, { type: data.error ? "error" : "stdout", text: data.output || data.error || "No output" }]);
  } catch {
    setConsoleLogs((prev) => [...prev, { type: "error", text: "❌ Error connecting to server" }]);
  }
};

  const clearConsole = () => setConsoleLogs([]);

  const startDrag = (bar: "left" | "center") => { dragInfo.current = { dragging: true, bar }; };
  const stopDrag = () => { dragInfo.current.dragging = false; };
  const onDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!dragInfo.current.dragging) return;
    const total = window.innerWidth;
    if (dragInfo.current.bar === "left") {
      const newLeft = (e.clientX / total) * 100;
      if (newLeft > 10 && newLeft < 70) { setLeftWidth(newLeft); setRightWidth(100 - newLeft - centerWidth); }
    } else if (dragInfo.current.bar === "center") {
      const newCenter = ((e.clientX - (leftWidth / 100) * total) / total) * 100;
      if (newCenter > 10 && newCenter < 70) { setCenterWidth(newCenter); setRightWidth(100 - leftWidth - newCenter); }
    }
  };

  useEffect(() => {
    console.log('Files state updated:', files);
  }, [files]);

  useEffect(() => {
    console.log('Active file updated:', activeFile);
  }, [activeFile]);

  return (
    <div className="h-screen w-screen flex flex-col" onMouseMove={onDrag} onMouseUp={stopDrag} onMouseLeave={stopDrag}>
      {/* 工具栏 */}
      <div className="p-2 bg-gray-100 flex gap-2 items-center">
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <button 
          onClick={() => {
            if (input.trim() !== "") {
              console.log('Running terminal input code');
              runCode(input);
              setInput("");
            } else {
              console.log('Running editor code');
              runCode();
            }
          }} 
          className="px-2 py-1 bg-blue-500 text-white"
        >Run</button>
        <button onClick={clearConsole} className="px-2 py-1 bg-red-500 text-white">Clear Console</button>
      </div>

      {/* 三栏 */}
      <div className="flex-1 flex relative">
        {/* 左侧文件管理器 */}
        <div style={{ width: `${leftWidth}%` }}>
          <FileExplorerTree
            files={files}
            setActiveFile={setActiveFile}
            addNode={addNode}
            deleteNode={deleteNode}
            renameNode={renameNode}
            activeFile={activeFile} // 添加这个属性
          />
        </div>
        <div onMouseDown={() => startDrag("left")} style={{ width: "5px", cursor: "col-resize", backgroundColor: "#888" }} />

        {/* 中间编辑器 */}
        <div style={{ width: `${centerWidth}%` }}>
          <EditorPanel activeFile={activeFile} setFileContent={setFileContent} />
        </div>
        <div onMouseDown={() => startDrag("center")} style={{ width: "5px", cursor: "col-resize", backgroundColor: "#888" }} />

        {/* 右侧终端 */}
        <div style={{ width: `${rightWidth}%`, display: "flex", flexDirection: "column" }}>
          <div ref={consoleRef} className="flex-1 bg-black p-2 font-mono overflow-auto">
            {consoleLogs.map((line, idx) => (
              <div key={idx} style={{ color: line.type === "stdout" ? "#0f0" : line.type === "error" ? "#f55" : "#fff" }}>
                {line.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type code and press Enter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-black text-white p-2 outline-none font-mono"
          />
        </div>
      </div>
    </div>
  );
};

export default App;
