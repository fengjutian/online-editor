import React, { useState, useEffect } from 'react';
import PluginManager from '../plugins/core/PluginManager';

const StatusBar: React.FC = () => {
  const [statusBarItems, setStatusBarItems] = useState<any[]>([]);
  const context = React.useContext<any>(React.createContext<any>(null)); 
  
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
  }, []);
  
  return (
    <div className="flex justify-between items-center bg-gray-200 dark:bg-gray-800 text-sm p-1 border-t">
      <div className="flex items-center">
        {statusBarItems.filter(item => item.alignment !== 'right').map(item => (
          <div key={item.id} className="px-2">
            {item.component({ context })}
          </div>
        ))}
      </div>
      <div className="flex items-center">
        {statusBarItems.filter(item => item.alignment === 'right').map(item => (
          <div key={item.id} className="px-2">
            {item.component({ context })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBar;