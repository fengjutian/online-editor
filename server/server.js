const express = require('express');
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// 检测 Docker 是否可用
let dockerAvailable = true;
let lastDockerCheck = 0;
const CHECK_INTERVAL = 30000; // 30秒检查一次

/**
 * 增强的Docker可用性检查函数
 * 不仅检查docker命令是否存在，还检查Docker引擎是否可以正常连接
 */
function checkDockerAvailability() {
  // 避免过于频繁的检查
  const now = Date.now();
  if (now - lastDockerCheck < CHECK_INTERVAL) {
    return;
  }
  lastDockerCheck = now;

  // 先检查docker命令是否存在
  exec("docker --version", (versionErr, versionStdout) => {
    if (versionErr) {
      console.warn("⚠️ Docker命令不可用。将使用本地环境运行代码。");
      dockerAvailable = false;
      return;
    }

    // 然后检查Docker引擎是否可以正常连接（使用docker info命令）
    exec("docker info", { timeout: 5000 }, (infoErr, infoStdout) => {
      if (infoErr) {
        console.warn("⚠️ Docker命令存在，但Docker引擎连接失败。错误: " + infoErr.message);
        console.warn("💡 提示: 请确保Docker Desktop正在运行，或者Windows Docker服务已启动。");
        dockerAvailable = false;
      } else {
        console.log("✅ Docker已准备就绪。");
        dockerAvailable = true;
      }
    });
  });
}

/**
 * 执行Docker命令的包装函数，包含错误处理和降级机制
 */
function executeWithDockerFallback(filename, dockerCmd, localCmd, language, callback) {
  // 在执行前再次检查Docker可用性
  checkDockerAvailability();
  
  if (dockerAvailable) {
    console.log(`尝试使用Docker运行${language}代码...`);
    exec(dockerCmd, { timeout: 8000 }, (err, stdout, stderr) => {
      // 检查是否是连接错误
      if (err && (
        stderr.includes('Head "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine') ||
        err.message.includes('cannot find the file specified')
      )) {
        console.warn("⚠️ Docker连接失败，正在切换到本地环境...");
        dockerAvailable = false; // 更新状态以便下次直接使用本地环境
        exec(localCmd, { timeout: 8000 }, callback);
      } else {
        callback(err, stdout, stderr);
      }
    });
  } else {
    console.log(`使用本地环境运行${language}代码...`);
    exec(localCmd, { timeout: 8000 }, callback);
  }
}

// 初始检查
checkDockerAvailability();

app.post("/run", (req, res) => {
  const { code, language } = req.body;

  const id = Date.now(); // 唯一ID
  let filename = "";
  let dockerCmd = "";
  let localCmd = "";

  switch (language) {
    case "javascript":
      filename = path.join(tempDir, `temp-${id}.js`);
      fs.writeFileSync(filename, code);
      dockerCmd = `docker run --rm -v "${filename}:${path.posix.join('/app', path.basename(filename))}" node:18 node ${path.posix.join('/app', path.basename(filename))}`;
      localCmd = `node "${filename}"`;
      break;

    case "python":
      filename = path.join(tempDir, `temp-${id}.py`);
      fs.writeFileSync(filename, code);
      dockerCmd = `docker run --rm -v "${filename}:${path.posix.join('/app', path.basename(filename))}" python:3.11 python ${path.posix.join('/app', path.basename(filename))}`;
      localCmd = `python "${filename}"`;
      break;

    case "java":
      filename = path.join(tempDir, `Temp-${id}.java`);
      fs.writeFileSync(filename, code);
      dockerCmd = 
        `docker run --rm -v "${tempDir}:/app" openjdk:17 bash -c "` +
        `javac /app/Temp-${id}.java && java -cp /app Temp-${id}` +
        `"`;
      localCmd = `javac "${filename}" && java -cp "${tempDir}" Temp-${id}`;
      break;

    default:
      return res.json({ error: "不支持的编程语言" });
  }

  executeWithDockerFallback(filename, dockerCmd, localCmd, language, (err, stdout, stderr) => {
    if (err) {
      // 增强错误信息，提供更具体的提示
      let errorMsg = stderr || err.message;
      if (errorMsg.includes('dockerDesktopLinuxEngine')) {
        errorMsg += '\n\n💡 解决方案: 请确保Docker Desktop正在运行，或者重启Docker服务。';
      }
      return res.json({ error: errorMsg });
    }
    res.json({ output: stdout });
    // 清理临时文件
    try {
      fs.unlinkSync(filename);
      // 清理Java编译生成的class文件
      if (language === "java") {
        const classFile = path.join(tempDir, `Temp-${id}.class`);
        if (fs.existsSync(classFile)) {
          fs.unlinkSync(classFile);
        }
      }
    } catch (_) {}
  });
});

app.listen(3001, () =>
  console.log(`🚀 服务器运行在 http://localhost:3001 - ${dockerAvailable ? '使用Docker' : '使用本地环境'}`)
);

// 定期检查Docker可用性
setInterval(checkDockerAvailability, CHECK_INTERVAL);
