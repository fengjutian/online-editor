import React from 'react';
import { EditorPlugin, EditorContext } from '../types';

// 示例插件组件
const ExampleSidebarPanel: React.FC<{ context: EditorContext }> = ({ context }) => {
  return (
    <div className="p-2 h-full bg-gray-100 dark:bg-gray-900 overflow-auto">
      <h3 className="font-medium mb-2">示例插件面板</h3>
      <p>这是一个示例插件面板</p>
    </div>
  );
};

// 示例状态栏项
const ExampleStatusBarItem: React.FC<{ context: EditorContext }> = ({ context }) => {
  return (
    <div className="px-2 py-1 text-sm">
      示例插件已激活
    </div>
  );
};

// 示例插件定义
// 确保ExamplePlugin的contributions正确设置
const ExamplePlugin: EditorPlugin = {
  metadata: {
    id: 'example-plugin',
    name: '示例插件',
    version: '1.0.0',
    description: '这是一个示例插件，展示了插件系统的基本功能',
    author: 'Online Editor Team'
  },
  
  activate: (context: EditorContext) => {
    console.log('示例插件已激活');
  },
  
  deactivate: () => {
    console.log('示例插件已停用');
  },
  
  contributions: {
    sidebarPanels: [
      {
        id: 'example-sidebar-panel',
        title: '示例面板',
        icon: '🔌',
        component: ExampleSidebarPanel
      }
    ],
    
    commands: [
      {
        id: 'example-plugin:say-hello',
        title: '示例: 打招呼',
        execute: (context: EditorContext) => {
          context.addConsoleLog({ type: 'stdout', text: '你好！这是示例插件的命令输出。' });
        }
      }
    ],
    
    statusBarItems: [
      {
        id: 'example-status-bar-item',
        component: ExampleStatusBarItem,
        alignment: 'right',
        priority: 100
      }
    ]
  }
};

export default ExamplePlugin;