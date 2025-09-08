import React from 'react';

// 文件节点类型定义
export type FileNodeType = {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNodeType[];
};

// 插件元数据接口
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  icon?: string;
}

// 编辑器上下文接口
export interface EditorContext {
  activeFile: FileNodeType | null;
  files: FileNodeType[];
  setActiveFile: (file: FileNodeType) => void;
  setFileContent: (file: FileNodeType, content: string) => void;
  consoleLogs: Array<{ type: 'stdout' | 'stderr' | 'info' | 'error'; text: string }>;
  addConsoleLog: (log: { type: 'stdout' | 'stderr' | 'info' | 'error'; text: string }) => void;
  language: string;
  setLanguage: (language: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
}

// 插件贡献点接口
export interface PluginContributions {
  // 侧边栏面板
  sidebarPanels?: Array<{
    id: string;
    title: string;
    icon?: string;
    component: React.FC<{ context: EditorContext }>;
  }>;
  
  // 命令
  commands?: Array<{
    id: string;
    title: string;
    execute: (context: EditorContext) => void;
  }>;
  
  // 文件图标
  fileIcons?: Array<{
    extension: string;
    icon: string;
  }>;
  
  // 编辑器装饰器
  editorDecorations?: Array<{
    id: string;
    provideDecorations: (content: string, language: string) => any[];
  }>;
  
  // 状态栏项
  statusBarItems?: Array<{
    id: string;
    component: React.FC<{ context: EditorContext }>;
    alignment?: 'left' | 'right';
    priority?: number;
  }>;
}

// 插件接口
export interface EditorPlugin {
  metadata: PluginMetadata;
  activate: (context: EditorContext) => void;
  deactivate: () => void;
  contributions?: PluginContributions;
  methods?: any; // 添加methods属性，使类型定义更完整
}