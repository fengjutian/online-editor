#!/usr/bin/env python3
"""
Online Editor 服务管理脚本

功能：
  - 一键启动前后端服务
  - 查看服务状态
  - 停止服务
  - 安装依赖

使用方法：
  python run_server.py start      # 启动前后端服务
  python run_server.py stop       # 停止服务
  python run_server.py status     # 查看服务状态
  python run_server.py install    # 安装依赖
  python run_server.py -h/--help  # 显示帮助信息
"""

import os
import sys
import subprocess
import time
import platform
import signal
import psutil
import webbrowser

# 项目配置
FRONTEND_DIR = os.path.join(os.getcwd(), "client")
BACKEND_DIR = os.path.join(os.getcwd(), "server")
FRONTEND_PORT = 3000
BACKEND_PORT = 3001

# 检测操作系统
IS_WINDOWS = platform.system() == "Windows"


def print_color(text, color_code):
    """打印带颜色的文本"""
    if IS_WINDOWS:
        # Windows命令提示符不支持ANSI颜色代码
        print(text)
    else:
        print(f"\033[{color_code}m{text}\033[0m")


def print_success(text):
    """打印成功信息"""
    print_color(text, "32")  # 绿色


def print_error(text):
    """打印错误信息"""
    print_color(text, "31")  # 红色


def print_warning(text):
    """打印警告信息"""
    print_color(text, "33")  # 黄色


def print_info(text):
    """打印信息"""
    print_color(text, "34")  # 蓝色


def check_docker():
    """检查Docker服务是否可用"""
    try:
        if IS_WINDOWS:
            # Windows下检查Docker Desktop是否运行
            output = subprocess.check_output(["tasklist"], universal_newlines=True)
            if "Docker Desktop.exe" not in output:
                print_warning("警告: Docker Desktop 似乎没有运行。请确保Docker服务已启动。")
                return False
        else:
            # 非Windows系统使用docker ps命令检查
            subprocess.check_output(["docker", "ps"], stderr=subprocess.STDOUT)
        return True
    except (subprocess.SubprocessError, FileNotFoundError):
        print_error("错误: 无法连接到Docker服务。请确保Docker已安装并启动。")
        return False


def check_node():
    """检查Node.js是否已安装"""
    try:
        subprocess.check_output(["node", "--version"], stderr=subprocess.STDOUT)
        return True
    except (subprocess.SubprocessError, FileNotFoundError):
        print_error("错误: 未找到Node.js。请安装Node.js 16或更高版本。")
        return False


def install_dependencies():
    """安装项目依赖"""
    print_info("开始安装项目依赖...")
    
    # 检查Node.js
    if not check_node():
        return False
    
    # 安装前端依赖
    print_info("安装前端依赖...")
    npm_cmd = "npm.cmd" if IS_WINDOWS else "npm"
    
    try:
        subprocess.run([npm_cmd, "install"], cwd=FRONTEND_DIR, check=True)
        print_success("前端依赖安装成功")
    except subprocess.CalledProcessError:
        print_error("前端依赖安装失败")
        return False
    
    # 安装后端依赖
    print_info("安装后端依赖...")
    try:
        subprocess.run([npm_cmd, "install"], cwd=BACKEND_DIR, check=True)
        print_success("后端依赖安装成功")
    except subprocess.CalledProcessError:
        print_error("后端依赖安装失败")
        return False
    
    # 拉取Docker镜像
    print_info("拉取必要的Docker镜像...")
    if check_docker():
        docker_images = ["node:18", "python:3.11", "openjdk:17"]
        for image in docker_images:
            try:
                print_info(f"拉取 {image} 镜像...")
                subprocess.run(["docker", "pull", image], check=True)
            except subprocess.CalledProcessError:
                print_warning(f"警告: 拉取 {image} 镜像失败，将在首次运行时尝试再次拉取")
    
    print_success("所有依赖安装完成！")
    return True


def start_services():
    """启动前后端服务"""
    print_info("开始启动服务...")
    
    # 检查Docker
    check_docker()
    
    # 启动后端服务
    print_info("启动后端服务...")
    backend_cmd = ["npm.cmd", "start"] if IS_WINDOWS else ["npm", "start"]
    backend_process = subprocess.Popen(
        backend_cmd,
        cwd=BACKEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        shell=IS_WINDOWS
    )
    
    # 等待后端服务启动
    time.sleep(2)
    
    # 检查后端服务是否启动成功
    if backend_process.poll() is not None:
        print_error("后端服务启动失败")
        stderr = backend_process.stderr.read()
        if stderr:
            print_error(f"错误信息: {stderr}")
        return False
    
    print_success(f"后端服务已在端口 {BACKEND_PORT} 启动")
    
    # 启动前端服务
    print_info("启动前端服务...")
    frontend_cmd = ["npm.cmd", "start"] if IS_WINDOWS else ["npm", "start"]
    frontend_process = subprocess.Popen(
        frontend_cmd,
        cwd=FRONTEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        shell=IS_WINDOWS
    )
    
    # 等待前端服务启动
    time.sleep(3)
    
    # 检查前端服务是否启动成功
    if frontend_process.poll() is not None:
        print_error("前端服务启动失败")
        stderr = frontend_process.stderr.read()
        if stderr:
            print_error(f"错误信息: {stderr}")
        # 停止后端服务
        stop_process(backend_process)
        return False
    
    print_success(f"前端服务已在端口 {FRONTEND_PORT} 启动")
    
    # 打开浏览器
    try:
        print_info(f"正在打开浏览器访问 http://localhost:{FRONTEND_PORT}")
        webbrowser.open(f"http://localhost:{FRONTEND_PORT}")
    except Exception as e:
        print_warning(f"无法自动打开浏览器: {e}")
        print_info(f"请手动访问 http://localhost:{FRONTEND_PORT}")
    
    print_success("\n🎉 所有服务已成功启动！")
    print_info("提示: 按 Ctrl+C 停止所有服务")
    
    # 保持脚本运行，直到用户中断
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print_info("\n正在停止所有服务...")
    finally:
        # 停止服务
        stop_process(frontend_process)
        stop_process(backend_process)
        print_success("所有服务已停止")
    
    return True


def stop_process(process):
    """停止进程"""
    if process.poll() is None:
        if IS_WINDOWS:
            process.terminate()
        else:
            # 在Unix系统上，可以尝试更优雅的终止方式
            try:
                process.send_signal(signal.SIGINT)
                # 给进程一些时间来优雅退出
                time.sleep(2)
                # 如果进程仍然运行，则强制终止
                if process.poll() is None:
                    process.kill()
            except:
                process.kill()


def stop_services():
    """停止所有运行中的服务"""
    print_info("正在停止所有服务...")
    
    # 查找并停止Node.js进程
    stopped = False
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            pinfo = proc.info
            # 查找与项目相关的Node.js进程
            if pinfo['name'] in ['node.exe', 'node'] and pinfo['cmdline']:
                cmdline = ' '.join(pinfo['cmdline'])
                # 修复多行条件判断的语法错误
                if ('server.js' in cmdline and BACKEND_DIR in proc.cwd()) or \
                   ('react-scripts' in cmdline and FRONTEND_DIR in proc.cwd()):
                    print_info(f"停止进程: {pinfo['pid']} - {cmdline}")
                    proc.terminate()
                    stopped = True
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass  # 只需要一个pass语句
    
    if stopped:
        print_success("所有服务已停止")
    else:
        print_info("未找到运行中的服务进程")


def check_services_status():
    """检查服务状态"""
    print_info("检查服务状态...")
    
    backend_running = False
    frontend_running = False
    
    # 检查进程
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            pinfo = proc.info
            if pinfo['name'] in ['node.exe', 'node'] and pinfo['cmdline']:
                cmdline = ' '.join(pinfo['cmdline'])
                cwd = proc.cwd()
                
                if 'server.js' in cmdline and BACKEND_DIR in cwd:
                    backend_running = True
                    print_success(f"✅ 后端服务正在运行 - PID: {pinfo['pid']}")
                elif 'react-scripts' in cmdline and FRONTEND_DIR in cwd:
                    frontend_running = True
                    print_success(f"✅ 前端服务正在运行 - PID: {pinfo['pid']}")
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    
    if not backend_running:
        print_warning("❌ 后端服务未运行")
    if not frontend_running:
        print_warning("❌ 前端服务未运行")
    
    # 检查端口
    print_info("\n检查端口占用情况:")
    
    # 这个函数在Windows上可能需要额外的依赖
    try:
        import socket
        
        def check_port(port):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                return s.connect_ex(('localhost', port)) == 0
        
        backend_port_used = check_port(BACKEND_PORT)
        frontend_port_used = check_port(FRONTEND_PORT)
        
        print_info(f"端口 {BACKEND_PORT}: {'已占用' if backend_port_used else '空闲'}")
        print_info(f"端口 {FRONTEND_PORT}: {'已占用' if frontend_port_used else '空闲'}")
        
    except ImportError:
        print_warning("无法检查端口占用情况，请安装psutil和socket模块")


def show_help():
    """显示帮助信息"""
    print("\nOnline Editor 服务管理脚本")
    print("========================")
    print("\n功能:")
    print("  - 一键启动前后端服务")
    print("  - 查看服务状态")
    print("  - 停止服务")
    print("  - 安装依赖")
    print("\n使用方法:")
    print("  python run_server.py start      # 启动前后端服务")
    print("  python run_server.py stop       # 停止服务")
    print("  python run_server.py status     # 查看服务状态")
    print("  python run_server.py install    # 安装依赖")
    print("  python run_server.py -h/--help  # 显示帮助信息")


def main():
    """主函数"""
    if len(sys.argv) < 2:
        show_help()
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command in ['-h', '--help']:
        show_help()
    elif command == 'start':
        start_services()
    elif command == 'stop':
        stop_services()
    elif command == 'status':
        check_services_status()
    elif command == 'install':
        install_dependencies()
    else:
        print_error(f"未知命令: {command}")
        show_help()
        sys.exit(1)


if __name__ == "__main__":
    main()