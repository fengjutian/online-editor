import PluginManager from './PluginManager';
import { EditorPlugin } from '../types'; // 添加这一行导入

class PluginLoader {
  // 从目录加载插件
  async loadPluginsFromDirectory(): Promise<void> {
    try {
      // 加载示例插件
      const examplePlugin = await this.loadPlugin('example');
      if (examplePlugin) {
        PluginManager.registerPlugin(examplePlugin);
      }
      
      // 加载Open VSX插件市场集成插件
      const openVSXPlugin = await this.loadPlugin('open-vsx');
      if (openVSXPlugin) {
        PluginManager.registerPlugin(openVSXPlugin);
      }
      
      // 可以在这里添加更多内置插件
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  }

  // 加载单个插件
  private async loadPlugin(pluginName: string): Promise<EditorPlugin | null> {
    try {
      const module = await import(`../${pluginName}/index.ts`);
      const plugin = module.default;
      
      if (plugin && typeof plugin === 'object' && plugin.metadata && plugin.activate && plugin.deactivate) {
        return plugin;
      } else {
        console.error(`Invalid plugin structure: ${pluginName}`);
        return null;
      }
    } catch (error) {
      console.error(`Failed to load plugin ${pluginName}:`, error);
      return null;
    }
  }
}

// 导出单例
export default new PluginLoader();