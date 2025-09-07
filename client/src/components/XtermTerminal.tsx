import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

interface ConsoleLog {
  type: 'stdout' | 'stderr' | 'info' | 'error';
  text: string;
}

interface XtermTerminalProps {
  consoleLogs: ConsoleLog[];
  onCommand: (command: string) => void;
}

const XtermTerminal: React.FC<XtermTerminalProps> = ({ consoleLogs, onCommand }) => {
  const [command, setCommand] = useState('');
  const terminalRef = useRef<Terminal | null>(null);
  const terminalElementRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeTimeoutRef = useRef<number | null>(null);
  
  // 记录当前显示的日志数量
  const logCountRef = useRef(0);
  
  // 防止 ResizeObserver 循环的标志
  const isResizingRef = useRef(false);

  // 初始化终端
  useEffect(() => {
    if (!terminalElementRef.current) return;

    // 创建终端实例
    const term = new Terminal({
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4'
      },
      cursorBlink: true,
      scrollback: 1000,
      // 禁用自动调整大小相关的选项
      allowProposedApi: false
    });

    // 打开终端
    term.open(terminalElementRef.current);
    terminalRef.current = term;

    // 手动设置终端大小
    const updateTerminalSize = () => {
      if (!terminalRef.current || !containerRef.current) return;
      
      try {
        // 获取容器尺寸
        const { clientWidth, clientHeight } = containerRef.current;
        
        // 计算终端行列数 (基于字体大小约14px)
        const cols = Math.floor(clientWidth / 8); // 平均每个字符宽度约8px
        const rows = Math.floor(clientHeight / 16); // 平均每行高度约16px
        
        // 设置终端尺寸
        terminalRef.current.resize(cols, rows);
      } catch (error) {
        console.warn('Error resizing terminal:', error);
      }
    };

    // 立即更新大小
    updateTerminalSize();

    // 欢迎信息
    term.writeln('\x1b[34m欢迎使用在线代码编辑器终端!\x1b[0m');
    term.writeln('\x1b[32m输入代码并按 Enter 运行，或选择文件后点击 Run 按钮。\x1b[0m');
    term.writeln('');
    prompt();

    // 处理键盘输入
    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.key === 'Enter') {
        term.writeln('');
        onCommand(command);
        setCommand('');
        prompt();
      } else if (domEvent.key === 'Backspace' && command.length > 0) {
        // 处理退格键
        term.write('\b \b');
        setCommand(command.slice(0, -1));
      } else if (printable) {
        term.write(key);
        setCommand(command + key);
      }
    });

    // 监听窗口大小变化 (使用防抖)
    const handleResize = () => {
      if (isResizingRef.current) return;
      
      isResizingRef.current = true;
      
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = window.setTimeout(() => {
        updateTerminalSize();
        isResizingRef.current = false;
      }, 200);
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      
      if (terminalRef.current) {
        terminalRef.current.dispose();
        terminalRef.current = null;
      }
    };
  }, [onCommand]);

  // 显示提示符
  const prompt = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.write('\x1b[33m> \x1b[0m');
    }
  }, []);

  // 监听控制台日志变化
  useEffect(() => {
    // 确保终端已初始化
    if (!terminalRef.current) return;

    // 获取当前日志数量
    const currentCount = consoleLogs.length;
    
    // 如果有新的日志
    if (currentCount > logCountRef.current) {
      // 输出所有新的日志
      for (let i = logCountRef.current; i < currentCount; i++) {
        const log = consoleLogs[i];
        
        // 根据日志类型设置不同颜色
        let color = '37'; // 默认白色
        if (log.type === 'stdout') color = '32'; // 绿色
        else if (log.type === 'error' || log.type === 'stderr') color = '31'; // 红色
        else if (log.type === 'info') color = '34'; // 蓝色
        
        // 输出日志内容
        try {
          terminalRef.current.writeln(`\x1b[${color}m${log.text}\x1b[0m`);
        } catch (error) {
          console.warn('Error writing to terminal:', error);
        }
      }
      
      // 更新日志计数
      logCountRef.current = currentCount;
      
      // 显示提示符
      prompt();
    }
  }, [consoleLogs, prompt]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 flex flex-col bg-black"
      style={{ 
        height: '100%', 
        width: '100%', 
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div 
        ref={terminalElementRef}
        style={{ 
          flex: 1,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />
    </div>
  );
};

export default XtermTerminal;