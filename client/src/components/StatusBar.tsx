import React, { useState, useEffect, useContext } from 'react';
import PluginManager from '../plugins/core/PluginManager';
import { AppEditorContext } from '../App';
import { FileNodeType } from '../types';

interface StatusBarItem {
  id: string;
  component: React.FC<any>;
  alignment?: 'left' | 'right';
  priority?: number;
}

const StatusBar: React.FC = () => {
  // 使用应用程序的全局上下文
  const context = useContext(AppEditorContext);
  const [statusBarItems, setStatusBarItems] = useState<StatusBarItem[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selection, setSelection] = useState({ lines: 0, characters: 0 });

  // 获取插件贡献的状态栏项
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
    
    // 监听插件加载完成事件，更新状态栏项
    const handlePluginsLoaded = () => {
      updateStatusBarItems();
    };
    
    // 模拟事件监听（实际项目中可能有真实的事件系统）
    // PluginManager.on('pluginsLoaded', handlePluginsLoaded);
    
    return () => {
      // PluginManager.off('pluginsLoaded', handlePluginsLoaded);
    };
  }, []);

  // 模拟光标位置和选择信息的更新
  useEffect(() => {
    // 在实际项目中，这里应该监听Monaco编辑器的光标位置变化事件
    const interval = setInterval(() => {
      // 模拟光标位置变化
      if (context?.activeFile) {
        // 这里应该从编辑器实例中获取实际的光标位置
        // 暂时使用随机值模拟
        const line = Math.floor(Math.random() * 20) + 1;
        const column = Math.floor(Math.random() * 30) + 1;
        setCursorPosition({ line, column });
        
        // 模拟选择信息（大部分时间没有选择）
        if (Math.random() > 0.8) {
          setSelection({ lines: Math.floor(Math.random() * 3) + 1, characters: Math.floor(Math.random() * 50) + 10 });
        } else {
          setSelection({ lines: 0, characters: 0 });
        }
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [context?.activeFile]);

  // 内置状态栏项组件
  const FileEncodingStatus: React.FC = () => (
    <div className="px-2 py-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded">
      UTF-8
    </div>
  );

  const LineColumnStatus: React.FC = () => {
    const { line, column } = cursorPosition;
    const { lines, characters } = selection;
    
    let displayText = `Ln ${line}, Col ${column}`;
    if (lines > 0 || characters > 0) {
      displayText += ` (${lines > 0 ? `${lines} 行` : `${characters} 字符`} 已选择)`;
    }
    
    return (
      <div className="px-2 py-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded">
        {displayText}
      </div>
    );
  };

  const LanguageModeStatus: React.FC = () => {
    const language = context?.language || 'plaintext';
    // 转换语言代码为显示名称
    const languageNames: { [key: string]: string } = {
      javascript: 'JavaScript',
      python: 'Python',
      java: 'Java',
      typescript: 'TypeScript',
      html: 'HTML',
      css: 'CSS',
      markdown: 'Markdown',
      plaintext: 'Plain Text'
    };
    
    const displayName = languageNames[language] || language;
    
    return (
      <div className="px-2 py-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded">
        {displayName}
      </div>
    );
  };

  const EndOfLineStatus: React.FC = () => (
    <div className="px-2 py-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded">
      CRLF
    </div>
  );

  const IndentationStatus: React.FC = () => (
    <div className="px-2 py-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded">
      空格: 2
    </div>
  );

  const StatusBarButton: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
    <div 
      className="px-2 py-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded flex items-center"
      onClick={onClick}
    >
      {label}
    </div>
  );

  // 内置状态栏项
  const builtInStatusBarItems: StatusBarItem[] = [
    { id: 'file-encoding', component: FileEncodingStatus, alignment: 'left', priority: 10 },
    { id: 'line-column', component: LineColumnStatus, alignment: 'right', priority: 100 },
    { id: 'language-mode', component: LanguageModeStatus, alignment: 'right', priority: 90 },
    { id: 'end-of-line', component: EndOfLineStatus, alignment: 'right', priority: 80 },
    { id: 'indentation', component: IndentationStatus, alignment: 'right', priority: 70 }
  ];

  // 组合所有状态栏项
  const allStatusBarItems = [...builtInStatusBarItems, ...statusBarItems];

  return (
    <div className="flex justify-between items-center bg-gray-200 dark:bg-gray-800 text-sm border-t border-gray-300 dark:border-gray-700 h-6">
      {/* 左侧状态栏项 */}
      <div className="flex items-center h-full">
        {allStatusBarItems
          .filter(item => item.alignment !== 'right')
          .sort((a, b) => (b.priority || 0) - (a.priority || 0))
          .map(item => (
            <React.Fragment key={item.id}>
              <div className="h-4 w-px bg-gray-400 dark:bg-gray-600 mx-1"></div>
              <item.component context={context} />
            </React.Fragment>
          ))}
      </div>
      
      {/* 右侧状态栏项 */}
      <div className="flex items-center h-full">
        {allStatusBarItems
          .filter(item => item.alignment === 'right')
          .sort((a, b) => (a.priority || 0) - (b.priority || 0))
          .map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <div className="h-4 w-px bg-gray-400 dark:bg-gray-600 mx-1"></div>}
              <item.component context={context} />
            </React.Fragment>
          ))}
        
        {/* 状态栏右侧按钮组 */}
        <div className="h-4 w-px bg-gray-400 dark:bg-gray-600 mx-1"></div>
        <StatusBarButton label="问题" />
        <StatusBarButton label="输出" />
        <StatusBarButton label="终端" />
        <StatusBarButton label="设置" />
      </div>
    </div>
  );
};

export default StatusBar;