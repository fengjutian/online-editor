import React, { useState, useRef, useEffect } from 'react';

import SubMenu from './SubMenu';


interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  children?: MenuItem[];
  enabled?: boolean;
}

interface MenuProps {
  menu: MenuItem;
  onClose: () => void;
  x: number;
  y: number;
}

// 菜单组件
const Menu: React.FC<MenuProps> = ({ menu, onClose, x, y }) => {
  const [showSubMenu, setShowSubMenu] = useState<string | null>(null);
  const [subMenuPos, setSubMenuPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (item: MenuItem, index: number) => {
    if (item.children && item.children.length > 0) {
      setSubMenuPos({ x: x + 180, y: y + index * 28 });
      setShowSubMenu(item.id);
    }
  };

  return (
    <div className="relative">
      <div 
        className="absolute bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]"
        style={{ left: x, top: y, zIndex: 1000 }}
      >
        {menu.children?.map((item, index) => {
          const isDisabled = item.enabled === false;
          
          return (
            <div
              key={item.id}
              className={`px-4 py-2 flex items-center justify-between cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (!isDisabled && !item.children) {
                  if (item.onClick) item.onClick();
                  onClose();
                }
              }}
              onMouseEnter={() => handleMouseEnter(item, index)}
            >
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.shortcut}</span>
              )}
              {item.children && (
                <span className="text-gray-500 dark:text-gray-400">→</span>
              )}
            </div>
          );
        })}
      </div>
      
      {showSubMenu && (
        <SubMenu 
          items={menu.children?.find(i => i.id === showSubMenu)?.children || []}
          onClose={onClose}
          x={subMenuPos.x}
          y={subMenuPos.y}
        />
      )}
    </div>
  );
};

export default Menu;