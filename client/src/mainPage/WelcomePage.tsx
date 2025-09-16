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

  // 增加拖拽状态管理
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // 处理文件夹上传（支持拖放API）
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    setUploadStatus('uploading');

    try {
      const dataTransfer = event.dataTransfer;
      
      // 处理拖放的文件列表
      if (dataTransfer.files && dataTransfer.files.length > 0) {
        // 检查是否有文件夹（通过判断是否有webkitGetAsEntry方法）
        const hasWebkitEntries = !!(dataTransfer.items && dataTransfer.items[0]?.webkitGetAsEntry);
        
        if (hasWebkitEntries && dataTransfer.items) {
          // 使用FileSystem API处理文件和文件夹
          const items = dataTransfer.items;
          const uploadedFiles = await processItems(items);
          setFiles((prev) => [...prev, ...uploadedFiles]);
          
          // 如果上传了单个文件，自动打开它
          if (uploadedFiles.length === 1 && uploadedFiles[0].type === 'file') {
            setActiveFile(uploadedFiles[0]);
          }
        } else {
          // 降级处理：只处理单个文件
          const promises = [];
          for (let i = 0; i < dataTransfer.files.length; i++) {
            const file = dataTransfer.files[i];
            promises.push(handleSingleFileUpload(file));
          }
          await Promise.all(promises);
        }
        
        setUploadStatus('success');
        // 3秒后重置状态
        setTimeout(() => setUploadStatus('idle'), 3000);
      } else {
        throw new Error('没有检测到拖放的文件');
      }
    } catch (error) {
      console.error('上传文件失败:', error);
      setUploadStatus('error');
      // 3秒后重置状态
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  // 实现缺失的processItems函数，用于处理拖放的文件项
  const processItems = async (items: DataTransferItemList): Promise<FileNodeType[]> => {
    const uploadedFiles: FileNodeType[] = [];
    const MAX_RECURSION_DEPTH = 20; // 设置最大递归深度
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const entry = item.webkitGetAsEntry?.();
        
        if (entry) {
          // 如果是文件，直接处理
          if (entry.isFile) {
            const fileEntry = entry as FileSystemFileEntry;
            const fileNode = await processFile(fileEntry, MAX_FILE_SIZE);
            if (fileNode) {
              uploadedFiles.push(fileNode);
            }
          } else if (entry.isDirectory) {
            // 如果是文件夹，递归处理
            const dirEntry = entry as FileSystemDirectoryEntry;
            const dirNode = await processDirectory(dirEntry, 0, MAX_RECURSION_DEPTH, MAX_FILE_SIZE);
            if (dirNode) {
              uploadedFiles.push(dirNode);
            }
          }
        }
      }
    } catch (error) {
      console.error('处理文件项失败:', error);
      // 即使部分文件处理失败，仍返回已处理的文件
    }
    
    return uploadedFiles;
  };

  // 处理单个文件项
  const processFile = (fileEntry: FileSystemFileEntry, maxFileSize: number): Promise<FileNodeType | null> => {
    return new Promise((resolve) => {
      fileEntry.file((file) => {
        // 检查文件大小
        if (file.size > maxFileSize) {
          console.warn(`文件 ${file.name} 超过大小限制 ${maxFileSize / (1024 * 1024)}MB`);
          resolve(null);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const newFile: FileNodeType = {
              id: Date.now().toString() + '-' + file.name,
              name: file.name,
              type: 'file',
              content
            };
            resolve(newFile);
          } catch (error) {
            console.error(`读取文件 ${file.name} 失败:`, error);
            resolve(null);
          }
        };
        reader.onerror = (error) => {
          console.error(`文件读取器错误:`, error);
          resolve(null);
        };
        reader.readAsText(file);
      }, (error) => {
        console.error(`获取文件信息失败:`, error);
        resolve(null);
      });
    });
  };

  // 处理文件夹项
  const processDirectory = async (dirEntry: FileSystemDirectoryEntry, 
                                 currentDepth: number, 
                                 maxDepth: number, 
                                 maxFileSize: number): Promise<FileNodeType | null> => {
    // 检查递归深度
    if (currentDepth >= maxDepth) {
      console.warn(`目录 ${dirEntry.name} 超过最大递归深度 ${maxDepth}`);
      return null;
    }
    
    try {
      const dirReader = dirEntry.createReader();
      const directoryNode: FileNodeType = {
        id: Date.now().toString() + '-' + dirEntry.name,
        name: dirEntry.name,
        type: 'folder',
        children: []
      };
      
      // 读取目录内容
      const readEntries = (): Promise<FileSystemEntry[]> => {
        return new Promise((resolve) => {
          dirReader.readEntries(resolve, () => resolve([]));
        });
      };
      
      let entries: FileSystemEntry[];
      do {
        entries = await readEntries();
        
        // 使用Promise.all处理多个文件，提高性能
        const promises = entries.map(async (entry) => {
          if (entry.isFile) {
            const fileEntry = entry as FileSystemFileEntry;
            const fileNode = await processFile(fileEntry, maxFileSize);
            if (fileNode && directoryNode.children) {
              directoryNode.children.push(fileNode);
            }
          } else if (entry.isDirectory) {
            const subDirEntry = entry as FileSystemDirectoryEntry;
            const subDirNode = await processDirectory(subDirEntry, currentDepth + 1, maxDepth, maxFileSize);
            if (subDirNode && directoryNode.children) {
              directoryNode.children.push(subDirNode);
            }
          }
        });
        
        await Promise.all(promises);
      } while (entries.length > 0);
      
      return directoryNode;
    } catch (error) {
      console.error(`处理目录 ${dirEntry.name} 失败:`, error);
      return null;
    }
  };

  // 处理单个文件上传（用于降级处理）
  const handleSingleFileUpload = (file: File): Promise<void> => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    return new Promise((resolve) => {
      // 检查文件大小
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`文件 ${file.name} 超过大小限制 ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        resolve();
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const newFile: FileNodeType = {
            id: Date.now().toString() + '-' + file.name,
            name: file.name,
            type: 'file',
            content
          };

          setFiles((prev) => [...prev, newFile]);
          // 对于单个文件上传，自动打开它
          if (file.size <= MAX_FILE_SIZE) {
            setActiveFile(newFile);
          }
        } catch (error) {
          console.error(`处理上传文件 ${file.name} 失败:`, error);
        } finally {
          resolve();
        }
      };
      reader.onerror = (error) => {
        console.error(`文件读取器错误:`, error);
        resolve();
      };
      reader.readAsText(file);
    });
  };

  // 处理拖拽经过
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  // 处理拖拽离开
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div 
      className="flex items-center justify-center h-full bg-[#1E1E1E] text-gray-300 p-8"
    >
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-white mb-4">AI时代代码辅助驾驶系统</h1>
        <h2 className="text-2xl font-bold text-white mb-4">行车不规范，亲人两行泪</h2>
        <p className="mb-6 text-gray-400">从左侧文件资源管理器中选择一个文件开始编辑，或创建新文件。</p>
        
        {/* 添加文件上传区域 */}
        <div className="mb-8">
          {/* 将拖拽事件处理器移到虚线框上，提供更好的用户体验 */}
          <div 
            className={`border-2 rounded-lg p-8 mb-4 cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-900/20' : 'border-dashed border-gray-600 hover:border-blue-500'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {uploadStatus === 'uploading' ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-lg mb-2">正在处理文件...</p>
                <p className="text-sm text-gray-400">请稍候</p>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="flex flex-col items-center">
                <div className="text-green-500 text-4xl mb-3">✓</div>
                <p className="text-lg mb-2">文件上传成功！</p>
                <p className="text-sm text-gray-400">正在加载文件...</p>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="flex flex-col items-center">
                <div className="text-red-500 text-4xl mb-3">✗</div>
                <p className="text-lg mb-2">文件上传失败</p>
                <p className="text-sm text-gray-400">请重试或使用文件选择器</p>
              </div>
            ) : (
              <>
                <p className="text-lg mb-2">📁 拖放文件或文件夹到此处</p>
                <p className="text-sm text-gray-500">支持单个文件或整个项目文件夹上传</p>
              </>
            )}
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
