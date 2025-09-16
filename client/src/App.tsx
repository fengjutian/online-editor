import 'reset-css';

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { vscodeDarkTheme, MenuItemGenerator } from './schema';
import Menu from './components/Menu';
import WelcomePage from './mainPage/WelcomePage';

import Docker from './ui/docker/index';


// 定义菜单相关类型
interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  children?: MenuItem[];
  enabled?: boolean;
}

// 创建全局上下文以在组件间共享编辑器状态
export const AppEditorContext = React.createContext<any>(null);

// 主应用组件
const App: React.FC = () => {
  // 状态定义
  const [activeSidebarPanel, setActiveSidebarPanel] = useState<string>('explorer');


  const [files, setFiles] = useState<FileNodeType[]>([
    { id: "1", name: "src", type: "folder", children: [{ id: "2", name: "main.js", type: "file", content: "// JS code" }] },
    { id: "3", name: "README.md", type: "file", content: "# Project" },
  ]);
  const [activeFile, setActiveFile] = useState<FileNodeType | null>(null);
  const [language, setLanguage] = useState<string>("javascript");
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [input, setInput] = useState<string>("");
  const [theme, setTheme] = useState<string>("vs-dark");
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  
  // 添加pluginsLoaded状态
  const [pluginsLoaded, setPluginsLoaded] = useState<boolean>(false);
  
  const [leftWidth, setLeftWidth] = useState<number>(20);
  const [centerWidth, setCenterWidth] = useState<number>(50);
  const [rightWidth, setRightWidth] = useState<number>(30);
  const dragInfo = useRef<{ dragging: boolean; bar: "left" | "center" | null }>({ dragging: false, bar: null });
  const menuBarRef = useRef<HTMLDivElement>(null);

  
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

    console.log("addNode", parent, newNode, files)
  };

    // 运行代码
  const runCode = async (runInput?: string) => {
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

// 在组件内部使用useMemo确保sidebarPanels在files状态变化时重新计算
const sidebarPanels = useMemo(() => [
  {
    id: 'explorer',
    visible: activeSidebarPanel === 'explorer',
    component: (
      <>
        <FileExplorerTree
          files={files}
          setActiveFile={setActiveFile}
          addNode={addNode}
          deleteNode={deleteNode}
          renameNode={renameNode}
          activeFile={activeFile}
        />
      </>
    )
  },
  {
    id: 'search',
    visible: activeSidebarPanel === 'search',
    component: <div className="p-4 text-white">搜索面板</div>
  },
  {
    id: 'extensions',
    visible: activeSidebarPanel === 'extensions',
    component: (
      <div className="p-4 text-white">
        <PluginSidebarPanels pluginsLoaded={pluginsLoaded} />
      </div>
    )
  }
], [files, activeFile, activeSidebarPanel, setActiveFile, addNode, deleteNode, renameNode, pluginsLoaded]);


  const menuBar: MenuItem[] = MenuItemGenerator(
    files, 
    addNode ,
    runCode, 
    activeFile, 
    clearConsole,
    setTheme,
    setLanguage,
  );

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
  const updateTree = (nodes: FileNodeType[], target: FileNodeType, updater: (n: FileNodeType) => FileNodeType | null): FileNodeType[] => {
    console.log('nodes', nodes)
    return nodes.flatMap((n) => {
      if (n === target) {
        const updated = updater(n);
        return updated ? [updated] : [];
      }
      if (n.type === "folder") return [{ ...n, children: updateTree(n.children || [], target, updater) }];
      return [n];
    })
  };

  // 设置文件内容
  const setFileContent = (file: FileNodeType, content: string) => {
    setFiles((prev) => updateTree(prev, file, (n) => ({ ...n, content })));
    if (activeFile && activeFile.id === file.id) {
      setActiveFile({ ...file, content });
    }
  };

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
      monaco.editor.defineTheme("vscode-dark", vscodeDarkTheme);
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

  // 处理菜单点击
  const handleMenuClick = (menu: MenuItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡
    const rect = menuBarRef.current?.getBoundingClientRect();
    if (rect) {
      const menuElement = document.getElementById(`menu-${menu.id}`);
      const x = menuElement ? menuElement.offsetLeft : 0;
      setMenuPos({ x, y: rect.height });
      setShowMenu(menu.id);
    }
  };

  // 处理文档点击关闭菜单
  useEffect(() => {
    const handleDocumentClick = () => {
      setShowMenu(null);
    };

    if (showMenu) {
      document.addEventListener('click', handleDocumentClick);
    }

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [showMenu]);

  // 添加编辑器引用
  const editorRef = useRef<any>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 添加窗口大小变化处理
  useEffect(() => {
    const handleResize = () => {
      // 清除之前的定时器
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // 使用防抖处理，避免频繁更新
      resizeTimeoutRef.current = setTimeout(() => {
        // 手动触发编辑器布局更新
        if (editorRef.current) {
          editorRef.current.layout();
        }
      }, 100);
    };
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    
    // 组件卸载时清理
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // 切换侧边栏面板的处理函数
const handleSidebarPanelToggle = (panelId: string) => {
  setActiveSidebarPanel(panelId);
};

// 侧边栏图标的SVG组件
const SidebarIcon = ({ name, active, onClick }: { name: string, active: boolean, onClick: () => void }) => {
  const iconColors = {
    explorer: 'M22,19V3H2.01L2,19C2,20.1 2.9,21 4,21H20C21.1,21 22,20.1 22,19ZM8,13H16V15H8V13ZM8,9H16V11H8V9ZM4,7H20V5H4V7Z',
    search: 'M15.5,14H14.71L14.43,13.73C15.41,12.59 16,11.11 16,9.5C16,5.91 13.09,3 9.5,3C5.91,3 3,5.91 3,9.5C3,13.09 5.91,16 9.5,16C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5L19,20.5L20.5,19L15.5,14Z',
    extensions: 'M19.66,3.99C18.88,3.63 18,3.36 17.11,3.19C15.93,3 14.69,3 13.5,3H9.5C8.31,3 7.07,3 5.89,3.19C5,3.36 4.12,3.63 3.34,3.99L1.66,18L18.34,18L20.02,3.99M5.64,4.35C6.27,4.16 6.93,4.06 7.61,4.06C8.84,4.06 10,4.06 11.22,4.06C11.78,4.53 12.19,5.09 12.65,5.47C13.11,5.09 13.52,4.53 14.08,4.06C15.3,4.06 16.43,4.06 17.66,4.06C18.34,4.06 19,4.16 19.63,4.35L19.91,6.35L19.46,6.24C18.83,6.05 18.17,5.95 17.49,5.95C16.26,5.95 15.13,5.95 13.91,5.95C13.35,6.42 12.94,6.98 12.48,7.36C12.02,6.98 11.61,6.42 11.05,5.95C9.83,5.95 8.7,5.95 7.47,5.95C6.79,5.95 6.13,6.05 5.5,6.24L5.05,6.35L5.33,4.35M7.21,15.54L6.77,13.47L5.09,12.91L6.5,10.88L6,9.1L8.03,8.14L8.5,9.93L10.91,9.66L10.4,11.86L11.81,12.91L10.18,13.47L9.77,15.54L7.21,15.54M16.91,12.91L15.23,13.47L14.79,15.54L12.23,15.54L11.81,13.47L10.12,12.91L11.53,10.88L11.02,9.1L13.05,8.14L13.52,9.93L15.93,9.66L15.42,11.86L16.91,12.91Z'
  };

  const IconSvg = iconColors[name as keyof typeof iconColors] || iconColors.explorer;
  
  return (
    <button
      onClick={onClick}
      className={`p-3 flex flex-col items-center justify-center h-12 w-full transition-all duration-200 ${
        active 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
      title={
        name === 'explorer' ? '文件资源管理器' :
        name === 'search' ? '搜索' :
        name === 'extensions' ? '扩展'
        : ''
      }
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "white" : "currentColor"}>
        <path d={IconSvg} />
      </svg>
    </button>
  );
};

  return (
    <AppEditorContext.Provider value={contextValue}>
      <div className="h-screen w-screen flex flex-col bg-white dark:bg-gray-900" onMouseMove={onDrag} onMouseUp={stopDrag} onMouseLeave={stopDrag}>
        <div className="flex dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-8 bg-[#232a35] bg-opacity-100 text-white" ref={menuBarRef}>
          {menuBar.map((menu) => (
            <div
              key={menu.id}
              id={`menu-${menu.id}`}
              className="px-4 py-1 flex items-center text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => handleMenuClick(menu, e)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {menu.label}
            </div>
          ))}
        </div>

        {/* 显示菜单 */}
        {showMenu && (
          <Menu
            menu={menuBar.find(m => m.id === showMenu) || menuBar[0]}
            onClose={() => setShowMenu(null)}
            x={menuPos.x}
            y={menuPos.y}
          />
        )}

        {/* 工具栏 */}
        <div className="p-2 bg-gray-100 dark:bg-gray-800 flex gap-2 items-center border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => {
              if (input.trim() !== "") {
                runCode(input);
                setInput("");
              } else {
                runCode();
              }
            }} 
            className="px-2 py-1 bg-blue-500 text-white"
          >Run</button>
          <button onClick={clearConsole} className="px-2 py-1 bg-red-500 text-white">Clear Console</button>
        </div>

        {/* 三栏布局 */}
        <div className="flex-1 flex relative">
          <div style={{ width: `${60}px`, display: 'flex', flexDirection: 'column' }} className="bg-[#232323] border-r border-gray-700">
            <SidebarIcon 
              name="explorer" 
              active={activeSidebarPanel === 'explorer'} 
              onClick={() => handleSidebarPanelToggle('explorer')}
            />
            <SidebarIcon 
              name="search" 
              active={activeSidebarPanel === 'search'} 
              onClick={() => handleSidebarPanelToggle('search')}
            />
            <SidebarIcon 
              name="extensions" 
              active={activeSidebarPanel === 'extensions'} 
              onClick={() => handleSidebarPanelToggle('extensions')}
            />
          </div>

          {/* 左侧区域 - 包含文件管理器和插件侧边栏面板 */}
          <div style={{ width: `${leftWidth}%`, display: 'flex', flexDirection: 'column' }} className="bg-[#1E1E1E] border-r border-gray-700">
            {/* 显示当前选中的侧边栏面板 */}
            {sidebarPanels.filter(panel => panel.visible).map(panel => (
              <div key={panel.id} className="flex-1">{panel.component}</div>
            ))}
          </div>
          <div onMouseDown={() => startDrag("left")} style={{ width: "5px", cursor: "col-resize", backgroundColor: "#888" }} />

          {/* 中间编辑器 - 添加ref属性和改进样式 */}
          <div style={{ width: `${centerWidth}%`, height: '100%', display: 'flex', flexDirection: 'column' }}>

            {
              activeFile ? (
                <Editor
                  height="100%"
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
                  // 添加ref回调函数
                  onMount={(editor) => {
                    editorRef.current = editor;
                  }}
                />
              ) : <WelcomePage setFiles={setFiles} setActiveFile={setActiveFile} />
           }
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

        <Docker />
      </div>
    </AppEditorContext.Provider> 
  );
};

export default App;