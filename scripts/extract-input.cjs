const fs = require("fs");
const path = require("path");

const buildInfoDir = path.join(__dirname, "..", "artifacts", "build-info");
const files = fs.readdirSync(buildInfoDir);
const buildInfoFile = files.find(f => f.endsWith(".json"));

const buildInfo = JSON.parse(fs.readFileSync(path.join(buildInfoDir, buildInfoFile), "utf8"));

fs.writeFileSync(
  path.join(__dirname, "..", "standard-input.json"),
  JSON.stringify(buildInfo.input, null, 2)
);

console.log("Done — created standard-input.json in your project root");