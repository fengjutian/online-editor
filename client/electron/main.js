const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const windowStateKeeper = require('electron-window-state');

// 确保只有一个实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

function createWindow() {
  // 保存窗口状态
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800
  });

  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: isDev
    },
    frame: true,
    titleBarStyle: 'default'
  });

  // 监听窗口状态变化
  mainWindowState.manage(mainWindow);

  // 加载应用
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // 在开发模式下打开开发者工具
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 创建应用菜单（可选）
  const menuTemplate = [
    {
      label: '应用',
      submenu: [
        { role: 'quit', label: '退出' }
      ]
    },
    {
      label: '查看',
      submenu: [
        { role: 'reload', label: '刷新' },
        { role: 'forcereload', label: '强制刷新' },
        { type: 'separator' },
        { role: 'toggledevtools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetzoom', label: '重置缩放' },
        { role: 'zoomin', label: '放大' },
        { role: 'zoomout', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// 预加载脚本
// 在 app.whenReady() 之前添加
const createPreloadScript = () => {
  const fs = require('fs');
  const preloadPath = path.join(__dirname, 'preload.js');
  const preloadContent = `
    const { contextBridge, ipcRenderer } = require('electron');

    // 安全地向渲染进程暴露API
    contextBridge.exposeInMainWorld('electronAPI', {
      // 这里可以添加需要的API
    });
  `;

  fs.writeFileSync(preloadPath, preloadContent);
};

createPreloadScript();

// 应用就绪后创建窗口
app.whenReady().then(() => {
  createWindow();

  // 在macOS上，当点击dock图标且没有其他窗口打开时，创建一个新窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，应用及其菜单栏通常保持活动状态，直到用户使用Cmd+Q显式退出
  if (process.platform !== 'darwin') app.quit();
});

// 处理第二个实例
app.on('second-instance', () => {
  const window = BrowserWindow.getAllWindows()[0];
  if (window) {
    if (window.isMinimized()) window.restore();
    window.focus();
  }
});