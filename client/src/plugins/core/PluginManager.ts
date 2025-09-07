import { EditorPlugin, EditorContext, PluginMetadata } from '../types';
import EventBus from './EventBus';

class PluginManager {
  private plugins: Map<string, EditorPlugin> = new Map();
  private activePlugins: Set<string> = new Set();
  private context: EditorContext | null = null;

  // 设置编辑器上下文
  setContext(context: EditorContext): void {
    this.context = context;
  }

  // 注册插件
  registerPlugin(plugin: EditorPlugin): void {
    const { id } = plugin.metadata;
    if (this.plugins.has(id)) {
      console.warn(`Plugin with ID ${id} is already registered`);
      return;
    }
    
    this.plugins.set(id, plugin);
    console.log(`Plugin registered: ${plugin.metadata.name} v${plugin.metadata.version}`);
    
    // 触发插件注册事件
    EventBus.emit('plugin:registered', plugin);
  }

  // 激活插件
  activatePlugin(pluginId: string): boolean {
    if (!this.context) {
      console.error('Cannot activate plugin: Editor context is not set');
      return false;
    }

    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`Plugin not found: ${pluginId}`);
      return false;
    }

    if (this.activePlugins.has(pluginId)) {
      console.warn(`Plugin is already active: ${pluginId}`);
      return false;
    }

    try {
      plugin.activate(this.context);
      this.activePlugins.add(pluginId);
      console.log(`Plugin activated: ${plugin.metadata.name}`);
      EventBus.emit('plugin:activated', plugin);
      return true;
    } catch (error) {
      console.error(`Failed to activate plugin ${pluginId}:`, error);
      return false;
    }
  }

  // 停用插件
  deactivatePlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !this.activePlugins.has(pluginId)) {
      console.warn(`Plugin is not active: ${pluginId}`);
      return false;
    }

    try {
      plugin.deactivate();
      this.activePlugins.delete(pluginId);
      console.log(`Plugin deactivated: ${plugin.metadata.name}`);
      EventBus.emit('plugin:deactivated', plugin);
      return true;
    } catch (error) {
      console.error(`Failed to deactivate plugin ${pluginId}:`, error);
      return false;
    }
  }

  // 激活所有插件
  activateAllPlugins(): void {
    this.plugins.forEach((plugin) => {
      this.activatePlugin(plugin.metadata.id);
    });
  }

  // 停用所有插件
  deactivateAllPlugins(): void {
    this.activePlugins.forEach((pluginId) => {
      this.deactivatePlugin(pluginId);
    });
  }

  // 获取所有插件元数据
  getAllPluginsMetadata(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map(plugin => plugin.metadata);
  }

  // 获取所有激活的插件
  getActivePlugins(): string[] {
    return Array.from(this.activePlugins);
  }

  // 获取插件贡献点
  getPluginContributions() {
    const contributions: any = {
      sidebarPanels: [],
      commands: [],
      fileIcons: [],
      editorDecorations: [],
      statusBarItems: []
    };

    this.plugins.forEach((plugin) => {
      if (this.activePlugins.has(plugin.metadata.id) && plugin.contributions) {
        Object.entries(plugin.contributions).forEach(([key, value]) => {
          if (contributions[key] && Array.isArray(value)) {
            contributions[key] = [...contributions[key], ...value];
          }
        });
      }
    });

    return contributions;
  }
}

// 导出单例
export default new PluginManager();