// 文件节点类型定义
export interface FileNodeType {
  id: string; // 唯一 ID
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNodeType[];
}

// 控制台日志类型
export interface ConsoleLog {
  type: "stdout" | "stderr" | "error" | "info";
  text: string;
}

// 文件节点属性接口
export interface FileNodeProps {
  node: FileNodeType;
  level?: number;
  setActiveFile: (file: FileNodeType) => void;
  addNode: (parent: FileNodeType, type: "file" | "folder") => void;
  deleteNode: (node: FileNodeType) => void;
  renameNode: (node: FileNodeType, newName: string) => void;
  activeFile: FileNodeType | null;
}

// 文件浏览器树属性接口
export interface FileExplorerTreeProps {
  files: FileNodeType[];
  setActiveFile: (file: FileNodeType) => void;
  addNode: (parent: FileNodeType, type: "file" | "folder") => void;
  deleteNode: (node: FileNodeType) => void;
  renameNode: (node: FileNodeType, newName: string) => void;
  activeFile: FileNodeType | null;
}

// 编辑器面板属性接口
export interface EditorPanelProps {
  activeFile: FileNodeType | null;
  setFileContent: (file: FileNodeType, content: string) => void;
  theme: string;
}

// 插件侧边栏面板属性接口
export interface PluginSidebarPanelsProps {
  pluginsLoaded?: boolean;
}

// Activity Bar 项目接口
export interface ActivityBarItem {
  id: string;
  icon: string;
  label: string;
  panel?: React.FC<{ context: any }>;
}