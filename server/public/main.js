console.log("main.js loaded");
const page = document.body.dataset.page; 

const modelComparisonStore = {
  deepseek: null,
  qwen: null
};
let mcAccuracyBarChart;
let mcLatencyBarChart;


// ---------------------- Tabs ----------------------
if (page === "project") {
  document.querySelectorAll(".evaluation-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.target;

      document.querySelectorAll(".evaluation-tab").forEach(t => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });

      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      document.querySelectorAll(".evaluation-panel").forEach(panel => {
        panel.classList.add("is-hidden");
      });

      document.getElementById(`panel-${target}`).classList.remove("is-hidden");
    });
  });
}


// ---------------------- Config ----------------------
let wsReady = false;

// ---------------------- Panel Setup ----------------------
function setupEvaluationPanel({
  panelId,
  limitInputId,
  startBtnId,
  statusLogId,
  accuracyLogId,
  model
}) {
  const panel = document.getElementById(panelId);
  const limitInput = document.getElementById(limitInputId);
  const startBtn = document.getElementById(startBtnId);
  const statusLog = document.getElementById(statusLogId);
  const accuracyLog = document.getElementById(accuracyLogId);

  function logStatus(msg) {
    statusLog.textContent += msg + "\n\n";
    statusLog.scrollTop = statusLog.scrollHeight;
  }

  function validate() {
    const value = Number(limitInput.value);
    startBtn.disabled = !(
      wsReady &&
      Number.isInteger(value) &&
      value >= 1 &&
      value <= Number(limitInput.max)
    );
  }

  limitInput.addEventListener("input", validate);

  startBtn.addEventListener("click", async () => {
    statusLog.textContent = "";              
    logStatus(`🚀 Starting ${model.toUpperCase()} evaluation`);
    accuracyLog.textContent = "Running evaluation...";

    await fetch("/run/eval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        mode: panel.dataset.mode,
        limit: Number(limitInput.value)
      })
    });
  });

  return { panel, logStatus, accuracyLog, statusLog };

}

// ---------------------- Initialize Panels ----------------------
let zeroPanel, finePanel;

if (page === "project") {
  zeroPanel = setupEvaluationPanel({
    panelId: "panel-zero-vs-fine",
    limitInputId: "question-limit-zero",
    startBtnId: "start-evaluation-btn-zero",
    statusLogId: "status-log-zero",
    accuracyLogId: "accuracy-log-zero",
    model: "deepseek"
  });

  finePanel = setupEvaluationPanel({
    panelId: "panel-fine-vs-pre",
    limitInputId: "question-limit-fine",
    startBtnId: "start-evaluation-btn-fine",
    statusLogId: "status-log-fine",
    accuracyLogId: "accuracy-log-fine",
    model: "qwen"
  });
}

// ---------------------- WebSocket ----------------------
const wsProtocol = location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${wsProtocol}://${location.host}/ws`);

ws.onopen = () => {
  wsReady = true;

  if (page === "project") {
    zeroPanel.statusLog.textContent = "🟢 WebSocket connected\n";
    finePanel.statusLog.textContent = "🟢 WebSocket connected\n";

    // ✅ trigger validation so buttons enable
    document.getElementById("question-limit-zero")?.dispatchEvent(new Event("input"));
    document.getElementById("question-limit-fine")?.dispatchEvent(new Event("input"));
  }
};

function updateModelComparisonStore(msg) {
  // Only store model comparison results
  if (msg.type !== "done") return;
  if (msg.model !== "deepseek" && msg.model !== "qwen") return;

  modelComparisonStore[msg.model] = msg;

  // Only render if the model comparison panel exists on this page
  renderModelComparison();
}

function renderModelComparison() {
  const deepseek = modelComparisonStore.deepseek;
  const qwen = modelComparisonStore.qwen;

  const totalEl = document.getElementById("mc-kpi-total");
  const bestAccEl = document.getElementById("mc-kpi-best-accuracy");
  const latencyEl = document.getElementById("mc-kpi-latency");
  const winnerEl = document.getElementById("mc-kpi-winner");

  if (!totalEl || !bestAccEl || !latencyEl || !winnerEl) return;

  // If results not ready
  if (!deepseek || !qwen) {
    totalEl.textContent = "--";
    bestAccEl.textContent = "--";
    latencyEl.textContent = "--";
    winnerEl.textContent = "--";
    return;
  }

  // Total questions
  totalEl.textContent = deepseek.total ?? qwen.total;

  // Best accuracy
  const bestAccuracy = Math.max(deepseek.accuracy, qwen.accuracy);
  bestAccEl.textContent = `${bestAccuracy}%`;

  // Winner
  const winner =
    deepseek.accuracy > qwen.accuracy ? "DeepSeek" :
    qwen.accuracy > deepseek.accuracy ? "Qwen" :
    "Tie";

  winnerEl.textContent = winner;

  // Avg latency (winner-based)
  if (winner === "DeepSeek") {
    latencyEl.textContent = `${Math.round(deepseek.avg_latency_ms / 1000)} s`;
  } else if (winner === "Qwen") {
    latencyEl.textContent = `${Math.round(qwen.avg_latency_ms / 1000)} s`;
  } else {
    latencyEl.textContent = "--";
  }

  // Charts
  renderMcAccuracyBarChart(deepseek, qwen);
  renderMcLatencyBarChart(deepseek, qwen);
}

function showModelComparisonIfReady() {
  if (modelComparisonStore.deepseek || modelComparisonStore.qwen) {
    renderModelComparison();
  }
}


function renderMcLatencyBarChart(deepseek, qwen) {
  const canvas = document.getElementById("mcLatencyBarChart");
  if (!canvas) return;

  if (mcLatencyBarChart) mcLatencyBarChart.destroy();

  mcLatencyBarChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["DeepSeek", "Qwen"],
      datasets: [{
        label: "Avg Latency (ms)",
        data: [
          deepseek.avg_latency_ms,
          qwen.avg_latency_ms
        ],
        backgroundColor: [
          deepseek.avg_latency_ms < qwen.avg_latency_ms ? "#22c55e" : "#6366f1",
          qwen.avg_latency_ms < deepseek.avg_latency_ms ? "#22c55e" : "#6366f1"
        ],
        borderRadius: 8,
        maxBarThickness: 60
      }]
    },
options: {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#e5e7eb",
        font: { weight: "600" }
      }
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      titleColor: "#f9fafb",
      bodyColor: "#e5e7eb",
      borderColor: "rgba(148, 163, 184, 0.3)",
      borderWidth: 1
    }
  },
  scales: {
    x: {
      ticks: { color: "#9ca3af" },
      grid: { display: false }
    },
    y: {
      ticks: { color: "#9ca3af" },
      grid: { color: "rgba(148, 163, 184, 0.12)" }
    }
  }
}

  });
}


function renderMcAccuracyBarChart(deepseek, qwen) {
  if (!deepseek || !qwen) return;

  const canvas = document.getElementById("mcAccuracyBarChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (mcAccuracyBarChart) mcAccuracyBarChart.destroy();

  mcAccuracyBarChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["DeepSeek", "Qwen"],
      datasets: [{
        label: "Accuracy (%)",
        data: [deepseek.accuracy, qwen.accuracy],
        backgroundColor: [
          deepseek.accuracy > qwen.accuracy ? "#22c55e" : "#6366f1",
          qwen.accuracy > deepseek.accuracy ? "#22c55e" : "#6366f1"
        ],
        borderRadius: 8,
        maxBarThickness: 60
      }]
    },
options: {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#e5e7eb",
        font: { weight: "600" }
      }
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      titleColor: "#f9fafb",
      bodyColor: "#e5e7eb",
      borderColor: "rgba(148, 163, 184, 0.3)",
      borderWidth: 1
    }
  },
  scales: {
    x: {
      ticks: { color: "#9ca3af" },
      grid: { display: false }
    },
    y: {
      ticks: { color: "#9ca3af" },
      grid: { color: "rgba(148, 163, 184, 0.12)" }
    }
  }
}

  });
}



ws.onmessage = event => {
  const msg = JSON.parse(event.data);

  // ✅ Always update model comparison first
  updateModelComparisonStore(msg);

  // ---------------- Panel routing ----------------
  let targetPanel = null;

if (page === "project") {
  if (msg.mode === "fine-vs-pre") {
    targetPanel = finePanel;
  } else if (msg.mode === "zero-vs-fine") {
    targetPanel = zeroPanel;
  }
}


  // ---------------- Panel-specific UI updates ----------------
  if (targetPanel) {
    if (msg.type === "start") {
      targetPanel.logStatus(
        `📊 Evaluation started (${msg.total} questions)`
      );
    }

    if (msg.type === "progress") {
      targetPanel.logStatus(msg.msg);
    }

    if (msg.type === "result") {
      targetPanel.logStatus(
`Answer       : ${msg.answer}
Ground Truth : ${msg.ground_truth}
Correct      : ${msg.correct ? "YES" : "NO"}
Latency      : ${msg.latency_ms} ms`
      );
    }

    if (msg.type === "done") {
      localStorage.setItem(`analysis_${msg.model}`, JSON.stringify(msg));
      targetPanel.accuracyLog.textContent =
`Final Accuracy: ${msg.accuracy}%
Average Latency: ${msg.avg_latency_ms ?? "N/A"} ms`;
    }
  }
};



ws.onclose = () => {
  wsReady = false;

  if (page === "project") {
    zeroPanel.logStatus("🛑 WebSocket disconnected");
    finePanel.logStatus("🛑 WebSocket disconnected");
  }
};

if (page === "analysis") {
  const deepseek = JSON.parse(localStorage.getItem("analysis_deepseek"));
  const qwen = JSON.parse(localStorage.getItem("analysis_qwen"));

  if (deepseek) modelComparisonStore.deepseek = deepseek;
  if (qwen) modelComparisonStore.qwen = qwen;

  renderModelComparison();
}