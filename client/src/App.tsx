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
}

const FileNode: React.FC<FileNodeProps> = ({ node, level = 0, setActiveFile, addNode, deleteNode, renameNode }) => {
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

  return (
    <div style={{ paddingLeft: `${level * 16}px` }}>
      <div className="flex items-center gap-1">
        {node.type === "folder" && (
          <span onClick={toggleExpand} className="cursor-pointer">{expanded ? "📂" : "📁"}</span>
        )}
        {node.type === "file" && <span>📄</span>}
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
            className="border px-1"
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            onClick={() => node.type === "file" && setActiveFile(node)}
            className="cursor-pointer"
          >
            {node.name}
          </span>
        )}
        {node.type === "folder" && (
          <>
            <button onClick={() => addNode(node, "file")} className="ml-1 text-blue-500">+File</button>
            <button onClick={() => addNode(node, "folder")} className="ml-1 text-blue-500">+Folder</button>
          </>
        )}
        <button
          onClick={() => deleteNode(node)}
          className="ml-1 text-red-500"
        >x</button>
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
}

const FileExplorerTree: React.FC<FileExplorerTreeProps> = ({ files, setActiveFile, addNode, deleteNode, renameNode }) => (
  <div className="bg-gray-200 w-64 p-2 overflow-auto h-full">
    {files.map((node) => (
      <FileNode
        key={node.id}
        node={node}
        setActiveFile={setActiveFile}
        addNode={addNode}
        deleteNode={deleteNode}
        renameNode={renameNode}
      />
    ))}
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
    setFiles((prev) => updateTree(prev, file, (n) => ({ ...n, content })));
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
    if (!activeFile) return;
    const payload = { code: runInput || activeFile.content, language };
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

  return (
    <div className="h-screen w-screen flex flex-col" onMouseMove={onDrag} onMouseUp={stopDrag} onMouseLeave={stopDrag}>
      {/* 工具栏 */}
      <div className="p-2 bg-gray-100 flex gap-2 items-center">
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <button onClick={() => runCode()} className="px-2 py-1 bg-blue-500 text-white">Run</button>
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
