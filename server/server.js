const express = require("express");
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

function checkDockerAvailability() {
  exec("docker --version", (err, stdout) => {
    if (err) {
      console.warn("⚠️ Docker is not available. Will use local environment to run code.");
      dockerAvailable = false;
    } else {
      console.log("✅ Docker is available.");
      dockerAvailable = true;
    }
  });
}

// 初始检查
checkDockerAvailability();

app.post("/run", (req, res) => {
  const { code, language } = req.body;

  const id = Date.now(); // 唯一ID
  let filename = "";
  let cmd = "";

  switch (language) {
    case "javascript":
      filename = path.join(tempDir, `temp-${id}.js`);
      fs.writeFileSync(filename, code);
      if (dockerAvailable) {
        cmd = `docker run --rm -v ${filename}:/app/code.js node:18 node /app/code.js`;
      } else {
        cmd = `node ${filename}`;
      }
      break;

    case "python":
      filename = path.join(tempDir, `temp-${id}.py`);
      fs.writeFileSync(filename, code);
      if (dockerAvailable) {
        cmd = `docker run --rm -v ${filename}:/app/code.py python:3.11 python /app/code.py`;
      } else {
        cmd = `python ${filename}`;
      }
      break;

    case "java":
      filename = path.join(tempDir, `Temp-${id}.java`);
      fs.writeFileSync(filename, code);
      if (dockerAvailable) {
        cmd = 
          `docker run --rm -v ${tempDir}:/app openjdk:17 bash -c "` +
          `javac /app/Temp-${id}.java && java -cp /app Temp-${id}` +
          `"`;
      } else {
        cmd = `javac ${filename} && java -cp ${tempDir} Temp-${id}`;
      }
      break;

    default:
      return res.json({ error: "Unsupported language" });
  }

  exec(cmd, { timeout: 8000 }, (err, stdout, stderr) => {
    if (err) {
      return res.json({ error: stderr || err.message });
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
  console.log(`🚀 Server running at http://localhost:3001 - ${dockerAvailable ? 'Using Docker' : 'Using local environment'}`)
);
