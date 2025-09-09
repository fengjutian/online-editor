import React from 'react';
import { ActivityBarItem } from '../types';

// Activity Bar 组件
export const ActivityBar: React.FC<{
  items: ActivityBarItem[];
  activeItemId: string;
  onItemClick: (itemId: string) => void;
  context: any;
}> = ({ items, activeItemId, onItemClick, context }) => {
  return (
    <div className="bg-gray-800 dark:bg-gray-900 w-12 flex flex-col items-center py-2 border-r border-gray-700">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className={`w-8 h-8 flex items-center justify-center rounded-md mb-1 transition-colors ${activeItemId === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
      <div className="mt-auto">
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white">
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default ActivityBar;