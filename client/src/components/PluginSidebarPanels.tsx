import React, { useState, useEffect } from 'react';
import PluginManager from '../plugins/core/PluginManager';
import { PluginSidebarPanelsProps } from '../types';

const PluginSidebarPanels: React.FC<PluginSidebarPanelsProps> = ({ pluginsLoaded = false }) => {
  const [panels, setPanels] = useState<any[]>([]);
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const context = React.useContext<any>(React.createContext<any>(null));
  
  const updatePanels = () => {
    try {
      const contributions = PluginManager.getPluginContributions();
      console.log('Plugin contributions:', contributions);
      
      if (contributions.sidebarPanels && contributions.sidebarPanels.length > 0) {
        setPanels(contributions.sidebarPanels);
        // 默认激活第一个面板
        if (!activePanelId) {
          setActivePanelId(contributions.sidebarPanels[0].id);
        }
      } else {
        console.log('No sidebar panels found in plugin contributions');
        setPanels([]);
      }
    } catch (error) {
      console.error('Error fetching plugin contributions:', error);
    }
  };
  
  // 当pluginsLoaded状态变化时，更新面板
  useEffect(() => {
    if (pluginsLoaded) {
      console.log('Plugins loaded, updating panels...');
      updatePanels();
    }
  }, [pluginsLoaded]);
  
  // 找到当前激活的面板
  const activePanel = panels.find(panel => panel.id === activePanelId);
  
  return (
    <div className="border-t flex flex-col">
      {panels.length === 0 ? (
        <div className="p-2 text-xs text-gray-500 text-center">
          暂无可用插件面板
          <div className="text-blue-500 mt-1 cursor-pointer hover:underline" onClick={updatePanels}>
            点击刷新
          </div>
        </div>
      ) : (
        <>
          <div className="flex p-1 bg-gray-200 dark:bg-gray-800">
            {panels.map(panel => (
              <button
                key={panel.id}
                onClick={() => setActivePanelId(panel.id)}
                className={`flex items-center px-2 py-1 rounded-md text-xs mr-1 transition-colors ${activePanelId === panel.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`}
              >
                <span className="mr-1">{panel.icon}</span>
                <span>{panel.title}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto">
            {/* 使用activePanel变量而不是嵌套的条件渲染 */}
            {activePanel ? (
              <div className="h-full">
                {/* 修复：将函数调用改为JSX组件渲染 */}
                <activePanel.component context={context} />
              </div>
            ) : (
              <div className="p-2 text-xs text-gray-500 text-center">
                请选择一个插件面板
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PluginSidebarPanels;