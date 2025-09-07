import React, { useState } from 'react'; // 添加 React 导入

interface PluginDetailModalProps {
  plugin: any;
  context: any;
  onClose: () => void;
  onInstall: (plugin: any) => Promise<boolean>;
}

const PluginDetailModal: React.FC<PluginDetailModalProps> = ({ plugin, context, onClose, onInstall }) => {
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  // 处理安装
  const handleInstall = async () => {
    setInstalling(true);
    try {
      const success = await onInstall(plugin);
      if (success) {
        setInstalled(true);
        context.addConsoleLog({ type: 'info', text: `插件 ${plugin.displayName} 安装成功！` });
      } else {
        context.addConsoleLog({ type: 'error', text: `插件 ${plugin.displayName} 安装失败！` });
      }
    } catch (error) {
      context.addConsoleLog({ type: 'error', text: `插件 ${plugin.displayName} 安装时发生错误！` });
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* 模态框头部 */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{plugin.displayName || plugin.name}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            ×
          </button>
        </div>

        {/* 模态框内容 */}
        <div className="p-4">
          <div className="flex items-start mb-4">
            {plugin.iconUrl && (
              <img 
                src={plugin.iconUrl} 
                alt={plugin.displayName} 
                className="w-16 h-16 mr-4"
              />
            )}
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {plugin.description}
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>发布者: {plugin.publisher?.displayName || plugin.namespace}</span>
                <span>•</span>
                <span>版本: v{plugin.version}</span>
                {plugin.downloadCount && (
                  <>
                    <span>•</span>
                    <span>{plugin.downloadCount.toLocaleString()} 下载</span>
                  </>
                )}
                {plugin.lastUpdated && (
                  <>
                    <span>•</span>
                    <span>更新于: {new Date(plugin.lastUpdated).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 插件功能 */}
          {plugin.categories && plugin.categories.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">分类</h3>
              <div className="flex flex-wrap gap-1">
                {plugin.categories.map((category: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 插件标签 */}
          {plugin.tags && plugin.tags.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">标签</h3>
              <div className="flex flex-wrap gap-1">
                {plugin.tags.map((tag: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 插件许可 */}
          {plugin.license && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">许可</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{plugin.license}</p>
            </div>
          )}

          {/* 插件链接 */}
          {plugin.repository && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">仓库</h3>
              <a 
                href={plugin.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 dark:text-blue-400 hover:underline"
              >
                {plugin.repository}
              </a>
            </div>
          )}
        </div>

        {/* 模态框底部 */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            关闭
          </button>
          {!installed ? (
            <button 
              onClick={handleInstall}
              disabled={installing}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {installing ? '安装中...' : '安装'}
            </button>
          ) : (
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded"
              disabled
            >
              已安装
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PluginDetailModal;