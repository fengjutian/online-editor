export const vscodeDarkTheme = {
    base: "vs-dark" as  const ,
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
    }
}

import { FileNodeType, ConsoleLog } from './types';

export const MenuItemGenerator = (
    files: FileNodeType[], 
    addNode: Function, 
    runCode: Function, 
    activeFile: any, 
    clearConsole: Function,
    setTheme: Function,
    setLanguage: Function,

) => [
    {
      id: "file",
      label: "文件",
      children: [
        {
          id: "new-file",
          label: "新建文件",
          shortcut: "Ctrl+N",
          onClick: () => {
            const rootFolder = files.find(f => f.name === "src" && f.type === "folder");
            if (rootFolder) {
              addNode(rootFolder, "file");
            }
          }
        },
        {
          id: "new-folder",
          label: "新建文件夹",
          shortcut: "Ctrl+Shift+N",
          onClick: () => {
            const rootFolder = files.find(f => f.name === "src" && f.type === "folder");
            if (rootFolder) {
              addNode(rootFolder, "folder");
            }
          }
        },
        {
          id: "separator-1",
          label: "--------",
          enabled: false
        },
        {
          id: "run-code",
          label: "运行代码",
          shortcut: "F5",
          onClick: () => runCode(),
          enabled: !!activeFile
        },
        {
          id: "clear-console",
          label: "清空控制台",
          shortcut: "Ctrl+L",
          onClick: () => clearConsole()
        }
      ]
    },
    {
      id: "edit",
      label: "编辑",
      children: [
        {
          id: "undo",
          label: "撤销",
          shortcut: "Ctrl+Z"
        },
        {
          id: "redo",
          label: "重做",
          shortcut: "Ctrl+Y"
        },
        {
          id: "separator-2",
          label: "--------",
          enabled: false
        },
        {
          id: "cut",
          label: "剪切",
          shortcut: "Ctrl+X"
        },
        {
          id: "copy",
          label: "复制",
          shortcut: "Ctrl+C"
        },
        {
          id: "paste",
          label: "粘贴",
          shortcut: "Ctrl+V"
        }
      ]
    },
    {
      id: "view",
      label: "视图",
      children: [
        {
          id: "theme-light",
          label: "亮色主题",
          onClick: () => setTheme("vs")
        },
        {
          id: "theme-dark",
          label: "暗色主题",
          onClick: () => setTheme("vs-dark")
        },
        {
          id: "theme-custom",
          label: "自定义暗色",
          onClick: () => setTheme("vscode-dark")
        }
      ]
    },
    {
      id: "language",
      label: "语言",
      children: [
        {
          id: "lang-js",
          label: "JavaScript",
          onClick: () => setLanguage("javascript")
        },
        {
          id: "lang-python",
          label: "Python",
          onClick: () => setLanguage("python")
        },
        {
          id: "lang-java",
          label: "Java",
          onClick: () => setLanguage("java")
        }
      ]
    },
    {
      id: "help",
      label: "帮助",
      children: [
        {
          id: "about",
          label: "关于"
        },
        {
          id: "documentation",
          label: "文档"
        }
      ]
    }
  ];



