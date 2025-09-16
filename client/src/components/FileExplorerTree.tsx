import React from 'react';
import FileNode from './FileNode';
import { FileExplorerTreeProps } from '../types';

// 文件浏览器树组件
export const FileExplorerTree: React.FC<FileExplorerTreeProps> = ({ 
  files, 
  setActiveFile, 
  addNode, 
  deleteNode, 
  renameNode,
  activeFile 
}) => (  
  <div className="bg-gray-100 dark:bg-gray-900 p-1 overflow-auto h-full text-sm">
    <div className="p-1 mb-1 font-medium text-gray-500 dark:text-gray-400">
      Explorer
    </div>
    <div className="group">
      {files.map((node) => (
        <FileNode
          key={node.id}
          node={node}
          level={0}
          setActiveFile={setActiveFile}
          addNode={addNode}
          deleteNode={deleteNode}
          renameNode={renameNode}
          activeFile={activeFile}
        />
      ))}
    </div>
  </div>
);

export default FileExplorerTree;