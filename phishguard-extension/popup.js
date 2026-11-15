document.addEventListener("DOMContentLoaded", async () => {
  const urlDisplay = document.getElementById("current-url-display");
  const scanBtn = document.getElementById("scan-now-btn");
  const resultBox = document.getElementById("result-box");
  const resultLabel = document.getElementById("result-label");
  const resultDetails = document.getElementById("result-details");

  let activeUrl = "";

  // Query the current active browser tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      activeUrl = tab.url;
      urlDisplay.textContent = activeUrl;
    } else {
      urlDisplay.textContent = "No accessible web tab detected.";
      scanBtn.disabled = true;
    }
  } catch (e) {
    urlDisplay.textContent = "Error reading active tab.";
    scanBtn.disabled = true;
  }

  // Scan Button Handler
  scanBtn.addEventListener("click", async () => {
    if (!activeUrl) return;

    scanBtn.disabled = true;
    scanBtn.innerHTML = "<span>⏳</span><span>Analyzing Features...</span>";
    resultBox.style.display = "block";
    resultBox.className = "result-card";
    resultBox.style.background = "#0f1f35";
    resultBox.style.border = "1px solid #38bdf8";
    resultLabel.style.color = "#38bdf8";
    resultLabel.textContent = "Scanning 30 Heuristic Signals...";
    resultDetails.textContent = "Connecting to PhishGuard ML Engine on port 8000...";

    try {
      const startTime = performance.now();
      const response = await fetch("http://localhost:8000/predict-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ url: activeUrl }),
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to reach inference engine.`);
      }

      const html = await response.text();
      const isPhishing = html.includes("<strong>Phishing</strong>");

      if (isPhishing) {
        resultBox.className = "result-card result-phish";
        resultLabel.textContent = "🚨 PHISHING DETECTED";
        resultDetails.innerHTML = `Model flagged high-risk evasion signals on this domain.<br>Latency: <strong>${latencyMs}ms</strong>`;
      } else {
        resultBox.className = "result-card result-safe";
        resultLabel.textContent = "🛡️ VERIFIED LEGITIMATE";
        resultDetails.innerHTML = `Model verified valid SSL, DNS, and anchor signals.<br>Latency: <strong>${latencyMs}ms</strong>`;
      }
    } catch (err) {
      resultBox.style.border = "1px solid #f59e0b";
      resultBox.style.background = "rgba(245, 158, 11, 0.1)";
      resultLabel.style.color = "#f59e0b";
      resultLabel.textContent = "⚠️ Backend Unreachable";
      resultDetails.textContent =
        "Ensure the PhishGuard backend container is active on http://localhost:8000.";
    } finally {
      scanBtn.disabled = false;
      scanBtn.innerHTML = "<span>🔍</span><span>Scan Active Website</span>";
    }
  });
});
