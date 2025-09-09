import React, { useState, useRef, useEffect } from 'react';
import Editor, { loader } from "@monaco-editor/react";

// 导入组件
import XtermTerminal from './components/XtermTerminal';
import { FileExplorerTree } from './components/FileExplorer';
import PluginSidebarPanels from './components/PluginSidebarPanels';
import StatusBar from './components/StatusBar';

// 导入插件系统
import PluginLoader from './plugins/core/PluginLoader';
import PluginManager from './plugins/core/PluginManager';
import { EditorContext as EditorContextType } from './plugins/types';

// 导入类型
import { FileNodeType, ConsoleLog } from './types';

// 创建全局上下文以在组件间共享编辑器状态
const AppEditorContext = React.createContext<any>(null);

// 主应用组件
const App: React.FC = () => {
  // 状态定义
  const [files, setFiles] = useState<FileNodeType[]>([
    { id: "1", name: "src", type: "folder", children: [{ id: "2", name: "main.js", type: "file", content: "// JS code" }] },
    { id: "3", name: "README.md", type: "file", content: "# Project" },
  ]);
  const [activeFile, setActiveFile] = useState<FileNodeType | null>(null);
  const [language, setLanguage] = useState<string>("javascript");
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [input, setInput] = useState<string>("");
  const [theme, setTheme] = useState<string>("vs-dark");
  
  // 添加pluginsLoaded状态
  const [pluginsLoaded, setPluginsLoaded] = useState<boolean>(false);
  
  const [leftWidth, setLeftWidth] = useState<number>(20);
  const [centerWidth, setCenterWidth] = useState<number>(50);
  const [rightWidth, setRightWidth] = useState<number>(30);
  const dragInfo = useRef<{ dragging: boolean; bar: "left" | "center" | null }>({ dragging: false, bar: null });

  // 添加缺失的addConsoleLog函数
  const addConsoleLog = (log: ConsoleLog) => {
    setConsoleLogs(prev => [...prev, log]);
  };

  // 初始化插件系统
  useEffect(() => {
    const initializePlugins = async () => {
      try {
        // 创建编辑器上下文
        const editorContext: EditorContextType = {
          activeFile, 
          files,
          setActiveFile,
          setFileContent,
          consoleLogs,
          addConsoleLog,
          language,
          setLanguage,
          theme,
          setTheme
        };
        
        // 设置插件管理器的上下文
        PluginManager.setContext(editorContext);
        
        // 加载插件
        await PluginLoader.loadPluginsFromDirectory();
        
        // 激活所有插件
        PluginManager.activateAllPlugins();
        
        // 设置插件已加载的状态
        setPluginsLoaded(true);
        
        console.log('Plugins initialized successfully');
      } catch (error) {
        console.error('Failed to initialize plugins:', error);
        setPluginsLoaded(false); // 出错时也设置状态
      }
    };
    
    initializePlugins();
    
    // 清理函数
    return () => {
      PluginManager.deactivateAllPlugins();
    };
  }, []);
  
  // 当编辑器状态变更时，更新插件上下文
  useEffect(() => {
    const editorContext: EditorContextType = {
      activeFile, 
      files,
      setActiveFile,
      setFileContent,
      consoleLogs,
      addConsoleLog,
      language,
      setLanguage,
      theme,
      setTheme
    };
    
    PluginManager.setContext(editorContext);
  }, [activeFile, files, consoleLogs, language, theme]);

  // 更新文件树
  const updateTree = (nodes: FileNodeType[], target: FileNodeType, updater: (n: FileNodeType) => FileNodeType | null): FileNodeType[] =>
    nodes.flatMap((n) => {
      if (n === target) {
        const updated = updater(n);
        return updated ? [updated] : [];
      }
      if (n.type === "folder") return [{ ...n, children: updateTree(n.children || [], target, updater) }];
      return [n];
    });

  // 设置文件内容
  const setFileContent = (file: FileNodeType, content: string) => {
    setFiles((prev) => updateTree(prev, file, (n) => ({ ...n, content })));
    if (activeFile && activeFile.id === file.id) {
      setActiveFile({ ...file, content });
    }
  };

  // 添加节点
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

  // 删除节点
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

  // 重命名节点
  const renameNode = (node: FileNodeType, newName: string) => {
    setFiles((prev) => updateTree(prev, node, (n) => ({ ...n, name: newName })));
  };

  // 运行代码
  const runCode = async (runInput?: string) => {
    console.log(1234, runInput)

    if (!activeFile) return;
    
    // 优先使用runInput，如果没有则使用activeFile.content
    const codeContent = runInput || activeFile.content || "";
    
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

  // 清除控制台
  const clearConsole = () => setConsoleLogs([]);
  
  // 拖拽相关函数
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

  // Monaco编辑器主题初始化
  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.editor.defineTheme("vscode-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6A9955" },
          { token: "string", foreground: "CE9178" },
          { token: "keyword", foreground: "569CD6" },
          { token: "number", foreground: "B5CEA8" },
        ],
        colors: {
          "editor.background": "#1E1E1E",
          "editor.foreground": "#D4D4D4",
          "editorLineNumber.foreground": "#858585",
          "editorLineNumber.activeForeground": "#C6C6C6",
          "editorCursor.foreground": "#AEAFAD",
        },
      });
    });
  }, []);

  // 创建传递给上下文的value
  const contextValue = {
    activeFile,
    files,
    setActiveFile,
    setFileContent,
    consoleLogs,
    addConsoleLog,
    language,
    setLanguage,
    theme,
    setTheme
  };

  return (
    <AppEditorContext.Provider value={contextValue}>
      <div className="h-screen w-screen flex flex-col" onMouseMove={onDrag} onMouseUp={stopDrag} onMouseLeave={stopDrag}>
        {/* 工具栏 */}
        <div className="p-2 bg-gray-100 flex gap-2 items-center">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          {/* 主题切换 */}
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="vs">Light (VS)</option>
            <option value="vs-dark">Dark (VS)</option>
            <option value="vscode-dark">Dark+ (Custom)</option>
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

        {/* 三栏布局 */}
        <div className="flex-1 flex relative">
          {/* 左侧区域 - 包含文件管理器和插件侧边栏面板 */}
          <div style={{ width: `${leftWidth}%`, display: 'flex', flexDirection: 'column' }}>
            {/* 修复FileExplorerTree组件的props */}
            <FileExplorerTree
              files={files}
              setActiveFile={setActiveFile}
              addNode={addNode}
              deleteNode={deleteNode}
              renameNode={renameNode}
              activeFile={activeFile}
            />
            
            {/* 插件侧边栏面板容器 */}
            <PluginSidebarPanels pluginsLoaded={pluginsLoaded} />
          </div>
          <div onMouseDown={() => startDrag("left")} style={{ width: "5px", cursor: "col-resize", backgroundColor: "#888" }} />

          {/* 中间编辑器 */}
          <div style={{ width: `${centerWidth}%` }}>
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
              value={activeFile?.content || ""}
              onChange={(val) => activeFile && setFileContent(activeFile, val || "")}
            />
          </div>
          <div onMouseDown={() => startDrag("center")} style={{ width: "5px", cursor: "col-resize", backgroundColor: "#888" }} />

          {/* 右侧终端 - 使用新的XtermTerminal组件 */}
          <div style={{ width: `${rightWidth}%`, display: "flex", flexDirection: "column" }}>
            <XtermTerminal
              consoleLogs={consoleLogs}
              onCommand={(cmd) => {
                runCode(cmd);
              }}
            />
          </div>
        </div>
        
        {/* 状态栏 */}
        <StatusBar />
      </div>
    </AppEditorContext.Provider> 
  );
};

export default App;


