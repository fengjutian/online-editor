import React from 'react';
import { EditorPlugin } from '../types';

// 示例插件组件
const ExampleSidebarPanel: React.FC<{ context: any }> = ({ context }) => {
  return (
    <div className="p-2 h-full bg-gray-100 dark:bg-gray-900 overflow-auto">
      <h3 className="font-medium mb-2">示例插件面板</h3>
      <p>这是一个插件示例面板</p>
      {context.activeFile && (
        <div className="mt-2 p-2 bg-gray-200 dark:bg-gray-800 rounded">
          <p>当前文件: {context.activeFile.name}</p>
          <p>语言: {context.language}</p>
        </div>
      )}
      <button 
        className="mt-4 px-2 py-1 bg-blue-500 text-white rounded"
        onClick={() => {
          if (context.activeFile) {
            context.setFileContent(context.activeFile, `// 由示例插件添加的代码\n${context.activeFile.content || ''}`);
            context.addConsoleLog({ type: 'info', text: '示例插件已修改当前文件内容' });
          }
        }}
      >
        向当前文件添加代码
      </button>
    </div>
  );
};

// 示例状态栏项
const ExampleStatusBarItem: React.FC<{ context: any }> = ({ context }) => {
  return (
    <div className="px-2 py-1 text-sm">
      示例插件已激活
    </div>
  );
};

// 示例插件定义
const ExamplePlugin: EditorPlugin = {
  metadata: {
    id: 'example-plugin',
    name: '示例插件',
    version: '1.0.0',
    description: '这是一个示例插件，展示了插件系统的基本功能',
    author: 'Online Editor Team'
  },
  
  activate: (context) => {
    console.log('示例插件已激活');
    
    // 向控制台添加欢迎信息
    context.addConsoleLog({
      type: 'info',
      text: '🎉 示例插件已激活！查看侧边栏和状态栏的新功能。'
    });
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
        execute: (context) => {
          context.addConsoleLog({ type: 'stdout', text: '你好！这是示例插件的命令输出。' });
        }
      },
      {
        id: 'example-plugin:toggle-theme',
        title: '示例: 切换主题',
        execute: (context) => {
          const newTheme = context.theme === 'vs-dark' ? 'vs' : 'vs-dark';
          context.setTheme(newTheme);
          context.addConsoleLog({ type: 'info', text: `主题已切换为: ${newTheme}` });
        }
      }
    ],
    
    fileIcons: [
      { extension: 'plugin', icon: '🔌' },
      { extension: 'demo', icon: '📝' }
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