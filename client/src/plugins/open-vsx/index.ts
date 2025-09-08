import React from 'react';
import axios from 'axios'; // 添加axios导入
import { EditorPlugin, EditorContext } from '../types';
import EventBus from '../core/EventBus';
import OpenVSXMarketplacePanel from './OpenVSXMarketplacePanel';
import PluginDetailModal from './PluginDetailModal';

// Open VSX API 客户端
class OpenVSXClient {
  private baseUrl = 'https://open-vsx.org/api';
  
  // 搜索插件
  async searchPlugins(query: string, page: number = 1, pageSize: number = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/extensions/search`, {
        params: { query, size: pageSize, offset: (page - 1) * pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search plugins:', error);
      return { extensions: [] };
    }
  }
  
  // 获取插件详情
  async getPluginDetails(namespace: string, name: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/extensions/${namespace}/${name}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get plugin details:', error);
      return null;
    }
  }
  
  // 下载插件VSIX包
  async downloadPluginVSIX(namespace: string, name: string, version: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/extensions/${namespace}/${name}/${version}/file`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download plugin:', error);
      return null;
    }
  }
}

// 创建客户端实例
const client = new OpenVSXClient();
const installedPlugins: Map<string, any> = new Map();

// Open VSX插件
const OpenVSXPlugin: EditorPlugin & { methods?: any } = { // 使用类型断言添加methods
  metadata: {
    id: 'open-vsx-plugin',
    name: 'Open VSX插件市场',
    version: '1.0.0',
    description: '集成Open VSX插件市场，支持浏览、搜索和安装VS Code扩展',
    author: 'Online Editor Team'
  },
  
  activate: (context: EditorContext) => {
    console.log('Open VSX插件市场已激活');
    
    // 向控制台添加欢迎信息
    context.addConsoleLog({
      type: 'info',
      text: '🔌 Open VSX插件市场已激活！点击侧边栏的插件市场图标浏览和安装插件。'
    });
  },
  
  deactivate: () => {
    console.log('Open VSX插件市场已停用');
  },
  
  contributions: {
    sidebarPanels: [
      {
        id: 'open-vsx-marketplace-panel',
        title: '插件市场',
        icon: '🛒',
        component: OpenVSXMarketplacePanel
      }
    ],
    
    commands: [
      { id: 'open-vsx:open-marketplace',
        title: '打开插件市场',
        execute: (context: EditorContext) => {
          EventBus.emit('open-vsx:open-marketplace');
          context.addConsoleLog({ type: 'info', text: '正在打开Open VSX插件市场...' });
        }
      },
      { id: 'open-vsx:refresh-plugins',
        title: '刷新已安装插件',
        execute: (context: EditorContext) => {
          EventBus.emit('open-vsx:refresh-plugins');
          context.addConsoleLog({ type: 'info', text: '正在刷新已安装插件...' });
        }
      }
    ]
  },
  
  // 公开方法供其他组件使用
  methods: {
    searchPlugins: client.searchPlugins.bind(client),
    getPluginDetails: client.getPluginDetails.bind(client),
    downloadPluginVSIX: client.downloadPluginVSIX.bind(client),
    getInstalledPlugins: () => Array.from(installedPlugins.values()),
    installPlugin: async (pluginInfo: any) => {
      try {
        const { namespace, name, version } = pluginInfo;
        const vsixBlob = await client.downloadPluginVSIX(namespace, name, version);
        
        if (vsixBlob) {
          installedPlugins.set(`${namespace}.${name}`, {
            ...pluginInfo,
            installedAt: new Date().toISOString()
          });
          
          EventBus.emit('open-vsx:plugin-installed', pluginInfo);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to install plugin:', error);
        return false;
      }
    },
    uninstallPlugin: (pluginId: string) => {
      if (installedPlugins.has(pluginId)) {
        installedPlugins.delete(pluginId);
        EventBus.emit('open-vsx:plugin-uninstalled', pluginId);
        return true;
      }
      return false;
    }
  }
};

export default OpenVSXPlugin;