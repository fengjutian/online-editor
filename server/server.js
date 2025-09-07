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

app.post("/run", (req, res) => {
  const { code, language } = req.body;

  const id = Date.now(); // 唯一ID
  let filename = "";
  let dockerCmd = "";

  switch (language) {
    case "javascript":
      filename = path.join(tempDir, `temp-${id}.js`);
      fs.writeFileSync(filename, code);
      dockerCmd = `docker run --rm -v ${filename}:/app/code.js node:18 node /app/code.js`;
      break;

    case "python":
      filename = path.join(tempDir, `temp-${id}.py`);
      fs.writeFileSync(filename, code);
      dockerCmd = `docker run --rm -v ${filename}:/app/code.py python:3.11 python /app/code.py`;
      break;

    case "java":
      filename = path.join(tempDir, `Temp-${id}.java`);
      fs.writeFileSync(filename, code);
      dockerCmd =
        `docker run --rm -v ${tempDir}:/app openjdk:17 bash -c "` +
        `javac /app/Temp-${id}.java && java -cp /app Temp-${id}` +
        `"`;
      break;

    default:
      return res.json({ error: "Unsupported language" });
  }

  exec(dockerCmd, { timeout: 8000 }, (err, stdout, stderr) => {
    if (err) {
      return res.json({ error: stderr || err.message });
    }
    res.json({ output: stdout });
    // 清理临时文件
    try {
      fs.unlinkSync(filename);
    } catch (_) {}
  });
});

app.listen(3001, () =>
  console.log("🚀 Docker sandbox server running at http://localhost:3001")
);
