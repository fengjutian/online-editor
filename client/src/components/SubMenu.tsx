interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  children?: MenuItem[];
  enabled?: boolean;
}

interface SubMenuProps {
  items: MenuItem[];
  onClose: () => void;
  x: number;
  y: number;
}

// 子菜单组件
const SubMenu: React.FC<SubMenuProps> = ({ items, onClose, x, y }) => {
  return (
    <div 
      className="absolute bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]"
      style={{ left: x, top: y, zIndex: 1000 }}
    >
      {items.map((item) => {
        const isDisabled = item.enabled === false;
        
        return (
          <div
            key={item.id}
            className={`px-4 py-2 flex items-center justify-between cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (!isDisabled) {
                if (item.onClick) item.onClick();
                onClose();
              }
            }}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{item.shortcut}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SubMenu;
