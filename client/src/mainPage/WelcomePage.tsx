export default function WelcomePage(): React.ReactElement { 
    return (
        <div className="flex items-center justify-center h-full bg-[#1E1E1E] text-gray-300 p-8">
            <div className="text-center max-w-md">
                <h1 className="text-3xl font-bold text-white mb-4">欢迎使用在线代码编辑器</h1>
                <p className="mb-6 text-gray-400">从左侧文件资源管理器中选择一个文件开始编辑，或创建新文件。</p>
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
    )
}
