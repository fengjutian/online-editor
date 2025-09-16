import React from 'react';
import { FileNodeType } from '../types';

interface WelcomePageProps {
  setFiles: React.Dispatch<React.SetStateAction<FileNodeType[]>>;
  setActiveFile: (file: FileNodeType) => void;
}

export default function WelcomePage({ setFiles, setActiveFile }: WelcomePageProps): React.ReactElement {
  // 处理单个文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const newFile: FileNodeType = {
        id: Date.now().toString(),
        name: file.name,
        type: 'file',
        content
      };

      setFiles((prev) => [...prev, newFile]);
      setActiveFile(newFile);
    };
    reader.readAsText(file);
  };

  // 处理文件夹上传（支持拖放API）
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const items = event.dataTransfer.items;
    if (!items.length) return;

    const newFiles: FileNodeType[] = [];

    // 递归处理文件项
    const processItems = async (items: DataTransferItemList, parentPath: string = ''): Promise<FileNodeType[]> => {
      const results: FileNodeType[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind !== 'file') continue;

        const entry = item.webkitGetAsEntry();
        if (entry && entry.isDirectory) {
          const folder = await processDirectory(entry as FileSystemDirectoryEntry, parentPath + entry.name + '/');
          results.push(folder);
        } else if (entry && entry.isFile) {
          const file = await processFile(entry as FileSystemFileEntry, parentPath);
          results.push(file);
        }
      }

      return results;
    };

    // 处理文件夹
    const processDirectory = async (directoryEntry: FileSystemDirectoryEntry, path: string): Promise<FileNodeType> => {
      const reader = directoryEntry.createReader();
      const entries = await new Promise<FileSystemEntry[]>((resolve) => {
        reader.readEntries(resolve);
      });

      const children: FileNodeType[] = [];
      for (const entry of entries) {
        if (entry.isDirectory) {
          const folder = await processDirectory(entry as FileSystemDirectoryEntry, path + entry.name + '/');
          children.push(folder);
        } else if (entry.isFile) {
          const file = await processFile(entry as FileSystemFileEntry, path);
          children.push(file);
        }
      }

      return {
        id: Date.now().toString() + '-' + directoryEntry.name,
        name: directoryEntry.name,
        type: 'folder',
        children
      };
    };

    // 处理单个文件
    const processFile = (fileEntry: FileSystemFileEntry, path: string): Promise<FileNodeType> => {
      return new Promise((resolve) => {
        fileEntry.file((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: Date.now().toString() + '-' + file.name,
              name: file.name,
              type: 'file',
              content: e.target?.result as string
            });
          };
          reader.readAsText(file);
        });
      });
    };

    try {
      const uploadedFiles = await processItems(items);
      setFiles((prev) => [...prev, ...uploadedFiles]);
      
      // 如果上传了单个文件，自动打开它
      if (uploadedFiles.length === 1 && uploadedFiles[0].type === 'file') {
        setActiveFile(uploadedFiles[0]);
      }
    } catch (error) {
      console.error('上传文件失败:', error);
      alert('上传文件失败，请重试。');
    }
  };

  // 阻止默认拖放行为
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div 
      className="flex items-center justify-center h-full bg-[#1E1E1E] text-gray-300 p-8"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-white mb-4">欢迎使用在线代码编辑器</h1>
        <p className="mb-6 text-gray-400">从左侧文件资源管理器中选择一个文件开始编辑，或创建新文件。</p>
        
        {/* 添加文件上传区域 */}
        <div className="mb-8">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 mb-4 cursor-pointer hover:border-blue-500 transition-colors">
            <p className="text-lg mb-2">📁 拖放文件或文件夹到此处</p>
            <p className="text-sm text-gray-500">支持单个文件或整个项目文件夹上传</p>
          </div>
          
          <label className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded cursor-pointer transition-colors">
            <span>选择文件</span>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="p-4 rounded-lg bg-[#2D2D2D] border border-gray-700">
            <h3 className="text-white font-medium mb-2">📝 编辑代码</h3>
            <p className="text-sm text-gray-400">支持多种编程语言的语法高亮和自动补全</p>
          </div>
          <div className="p-4 rounded-lg bg-[#2D2D2D] border border-gray-700">
            <h3 className="text-white font-medium mb-2">▶️ 运行代码</h3>
            <p className="text-sm text-gray-400">直接在浏览器中执行代码并查看输出结果</p>
          </div>
        </div>
      </div>
    </div>
  );
}
