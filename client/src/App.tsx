import React, { useState, useRef, useEffect } from 'react';
import Editor, { loader } from "@monaco-editor/react";

// 导入XtermTerminal组件
import XtermTerminal from './components/XtermTerminal';

// 导入插件系统
import PluginLoader from './plugins/core/PluginLoader';
import PluginManager from './plugins/core/PluginManager';
import { EditorContext as EditorContextType } from './plugins/types'; // 重命名导入以避免冲突

// 文件节点类型定义 - 只保留一个定义
interface FileNodeType {
  id: string; // 唯一 ID
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNodeType[];
}

// 控制台日志类型 - 只保留一个定义
interface ConsoleLog {
  type: "stdout" | "stderr" | "error" | "info"; // 添加stderr类型
  text: string;
}

// 文件节点属性接口
interface FileNodeProps {
  node: FileNodeType;
  level?: number;
  setActiveFile: (file: FileNodeType) => void;
  addNode: (parent: FileNodeType, type: "file" | "folder") => void;
  deleteNode: (node: FileNodeType) => void;
  renameNode: (node: FileNodeType, newName: string) => void;
  activeFile: FileNodeType | null; // 添加这个属性
}

// 更新FileNode组件，添加VSCode风格样式
const FileNode: React.FC<FileNodeProps> = ({ 
  node, 
  level = 0, 
  setActiveFile, 
  addNode, 
  deleteNode, 
  renameNode,
  activeFile // 接收activeFile属性
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
          activeFile={activeFile} // 递归调用时传递activeFile
        />
      ))}
    </div>
  );
};

// 文件浏览器树属性接口
interface FileExplorerTreeProps {
  files: FileNodeType[];
  setActiveFile: (file: FileNodeType) => void;
  addNode: (parent: FileNodeType, type: "file" | "folder") => void;
  deleteNode: (node: FileNodeType) => void;
  renameNode: (node: FileNodeType, newName: string) => void;
  activeFile: FileNodeType | null; // 添加这个属性
}

// 文件浏览器树组件
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
          activeFile={activeFile} // 传递给FileNode
        />
      ))}
    </div>
  </div>
);

// 编辑器面板属性接口
interface EditorPanelProps {
  activeFile: FileNodeType | null;
  setFileContent: (file: FileNodeType, content: string) => void;
  theme: string;
}

// 编辑器面板组件
const EditorPanel: React.FC<EditorPanelProps> = ({ activeFile, setFileContent, theme }) => {
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
      value={activeFile.content}
      onChange={(val) => setFileContent(activeFile, val || "")}
    />
  );
};

// 创建全局上下文以在组件间共享编辑器状态
const AppEditorContext = React.createContext<any>(null); // 使用React.createContext

// 状态栏组件
const StatusBar: React.FC = () => {
  const [statusBarItems, setStatusBarItems] = useState<any[]>([]);
  const context = React.useContext(AppEditorContext); // 使用重命名后的Context
  
  useEffect(() => {
    const updateStatusBarItems = () => {
      const contributions = PluginManager.getPluginContributions();
      if (contributions.statusBarItems) {
        // 按优先级排序
        const sortedItems = [...contributions.statusBarItems].sort((a, b) => 
          (b.priority || 0) - (a.priority || 0)
        );
        setStatusBarItems(sortedItems);
      }
    };
    
    updateStatusBarItems();
  }, []);
  
  return (
    <div className="flex justify-between items-center bg-gray-200 dark:bg-gray-800 text-sm p-1 border-t">
      <div className="flex items-center">
        {statusBarItems.filter(item => item.alignment !== 'right').map(item => (
          <div key={item.id} className="px-2">
            {item.component({ context })}
          </div>
        ))}
      </div>
      <div className="flex items-center">
        {statusBarItems.filter(item => item.alignment === 'right').map(item => (
          <div key={item.id} className="px-2">
            {item.component({ context })}
          </div>
        ))}
      </div>
    </div>
  );
};

// 插件侧边栏面板组件
interface PluginSidebarPanelsProps {
  pluginsLoaded?: boolean;
}

const PluginSidebarPanels: React.FC<PluginSidebarPanelsProps> = ({ pluginsLoaded = false }) => {
  const [panels, setPanels] = useState<any[]>([]);
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const context = React.useContext(AppEditorContext);
  
  const updatePanels = () => {
    try {
      const contributions = PluginManager.getPluginContributions();
      console.log('Plugin contributions:', contributions);
      
      if (contributions.sidebarPanels && contributions.sidebarPanels.length > 0) {
        setPanels(contributions.sidebarPanels);
        // 默认激活第一个面板
        if (!activePanelId) {
          setActivePanelId(contributions.sidebarPanels[0].id);
        }
      } else {
        console.log('No sidebar panels found in plugin contributions');
        setPanels([]);
      }
    } catch (error) {
      console.error('Error fetching plugin contributions:', error);
    }
  };
  
  // 当pluginsLoaded状态变化时，更新面板
  useEffect(() => {
    if (pluginsLoaded) {
      console.log('Plugins loaded, updating panels...');
      updatePanels();
    }
  }, [pluginsLoaded]);
  
  // 找到当前激活的面板
  const activePanel = panels.find(panel => panel.id === activePanelId);
  
  return (
    <div className="border-t flex flex-col">
      {panels.length === 0 ? (
        <div className="p-2 text-xs text-gray-500 text-center">
          暂无可用插件面板
          <div className="text-blue-500 mt-1 cursor-pointer hover:underline" onClick={updatePanels}>
            点击刷新
          </div>
        </div>
      ) : (
        <>
          <div className="flex p-1 bg-gray-200 dark:bg-gray-800">
            {panels.map(panel => (
              <button
                key={panel.id}
                onClick={() => setActivePanelId(panel.id)}
                className={`flex items-center px-2 py-1 rounded-md text-xs mr-1 transition-colors ${
                  activePanelId === panel.id 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-1">{panel.icon}</span>
                <span>{panel.title}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto">
            {/* 使用activePanel变量而不是嵌套的条件渲染 */}
            {activePanel ? (
              <div className="h-full">
                {/* 修复：将函数调用改为JSX组件渲染 */}
                <activePanel.component context={context} />
              </div>
            ) : (
              <div className="p-2 text-xs text-gray-500 text-center">
                请选择一个插件面板
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// 主应用组件
const App: React.FC = () => {
  // 状态定义 - 将pluginsLoaded移到这里
  const [files, setFiles] = useState<FileNodeType[]>([
    { id: "1", name: "src", type: "folder", children: [{ id: "2", name: "main.js", type: "file", content: "// JS code" }] },
    { id: "3", name: "README.md", type: "file", content: "# Project" },
  ]);
  const [activeFile, setActiveFile] = useState<FileNodeType | null>(null);
  const [language, setLanguage] = useState<string>("javascript");
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [input, setInput] = useState<string>("");
  const [theme, setTheme] = useState<string>("vs-dark");
  
  // 添加pluginsLoaded状态到组件顶层
  const [pluginsLoaded, setPluginsLoaded] = useState<boolean>(false);
  
  const consoleRef = useRef<HTMLDivElement | null>(null);
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
    const editorContext: EditorContextType = { // 使用类型别名
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

  // 控制台滚动到最新日志
  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [consoleLogs]);

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

  // 处理键盘事件（保留为空，因为XtermTerminal会处理命令输入）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 留空，因为XtermTerminal会处理命令输入
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
    <AppEditorContext.Provider value={contextValue}> {/* 修改为正确的Context名称 */}
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
            <EditorPanel activeFile={activeFile} setFileContent={setFileContent} theme={theme} />
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

// 删除组件外部的useEffect钩子
// 修复：将这个钩子移到App组件内部，或者完全删除它

// 通知功能已经通过props传递给PluginSidebarPanels组件
// 因此这个额外的useEffect钩子是多余的

// 只保留export语句

export default App;


