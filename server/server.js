import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

import { initWebSocket } from "./ws.js";
import { runEval } from "./runEvalutor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views/index.html"));
});

app.get("/project", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views/project.html"));
});

app.get("/analysis", (req, res) => {
  res.sendFile(path.join(__dirname, "public/views/analysis.html"));
});

const server = http.createServer(app);
const ws = initWebSocket(server);

// ✅ API route
app.post("/run/eval", (req, res) => {
  const limit = Number(req.body?.limit ?? 10);
  const model = String(req.body?.model);
  const mode = String(req.body?.mode);

  runEval({ model, mode, limit, ws })
    .catch(err => {
      ws.broadcast({ type: "error", model, msg: err.message });
    });

  res.json({ ok: true, msg: `Started ${model} evaluation`, limit });
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
