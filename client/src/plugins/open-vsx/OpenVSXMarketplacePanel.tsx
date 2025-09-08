// Add React and hooks imports at the top
import React, { useState, useEffect } from 'react';
import OpenVSXPlugin from './index';
import PluginDetailModal from './PluginDetailModal';

interface OpenVSXMarketplacePanelProps {
  context: any;
}

const OpenVSXMarketplacePanel: React.FC<OpenVSXMarketplacePanelProps> = ({ context }) => {
  // Keep all existing hooks - they're now properly imported
  const [searchQuery, setSearchQuery] = useState('');
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 搜索插件 - 修复这里的调用方式
  const searchPlugins = async (query: string, pageNum: number = 1) => {
    setLoading(true);
    try {
      // 直接调用插件中定义的方法
      const result = await (OpenVSXPlugin as any).methods.searchPlugins(query, pageNum);
      setPlugins(result.extensions || []);
      setTotalCount(result.totalCount || 0);
    } catch (error) {
      context.addConsoleLog({ type: 'error', text: '搜索插件失败，请检查网络连接' });
    } finally {
      setLoading(false);
    }
  };

  // 初始加载热门插件
  useEffect(() => {
    searchPlugins('');
  }, []);

  // 处理搜索
  const handleSearch = () => {
    setPage(1);
    searchPlugins(searchQuery);
  };

  // 加载更多
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchPlugins(searchQuery, nextPage);
  };

  // 查看插件详情 - 同样需要修复这里的调用
  const viewPluginDetails = async (plugin: any) => {
    const details = await (OpenVSXPlugin as any).methods.getPluginDetails(plugin.namespace, plugin.name);
    if (details) {
      setSelectedPlugin(details);
      setShowModal(true);
    }
  };

  return (
    <div className="p-2 h-full bg-gray-100 dark:bg-gray-900 overflow-auto">
      <h3 className="font-medium mb-2">Open VSX插件市场</h3>
      
      {/* 搜索框 */}
      <div className="flex mb-3">
        <input
          type="text"
          placeholder="搜索插件..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-grow px-2 py-1 border rounded-l-md"
        />
        <button 
          onClick={handleSearch}
          className="px-2 py-1 bg-blue-500 text-white rounded-r-md"
        >
          搜索
        </button>
      </div>

      {/* 插件列表 */}
      {loading ? (
        <div className="text-center py-4">加载中...</div>
      ) : (
        <>
          {plugins.map((plugin) => (
            <div 
              key={`${plugin.namespace}.${plugin.name}`}
              className="p-2 mb-2 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => viewPluginDetails(plugin)}
            >
              <div className="flex items-start">
                {plugin.iconUrl && (
                  <img 
                    src={plugin.iconUrl} 
                    alt={plugin.displayName} 
                    className="w-8 h-8 mr-2 flex-shrink-0"
                  />
                )}
                <div className="flex-grow">
                  <h4 className="font-medium text-blue-600 dark:text-blue-400">{plugin.displayName || plugin.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {plugin.description}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{plugin.publisher?.displayName || plugin.namespace}</span>
                    <span className="mx-1">•</span>
                    <span>v{plugin.version}</span>
                    {plugin.downloadCount && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{plugin.downloadCount.toLocaleString()} 下载</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* 加载更多按钮 */}
          {totalCount > plugins.length && (
            <button 
              onClick={loadMore}
              className="w-full mt-3 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
            >
              加载更多
            </button>
          )}
        </>
      )}

      {/* 插件详情模态框 */}
      {showModal && selectedPlugin && (
        <PluginDetailModal
          plugin={selectedPlugin}
          context={context}
          onClose={() => setShowModal(false)}
          onInstall={OpenVSXPlugin.methods.installPlugin}
        />
      )}
    </div>
  );
};

export default OpenVSXMarketplacePanel;