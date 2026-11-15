// PhishGuard Real-Time In-Browser URL Threat Detector
(function () {
  // Do not run on internal browser pages or PhishGuard's own dashboard
  const currentUrl = window.location.href;
  if (
    currentUrl.startsWith("chrome://") ||
    currentUrl.startsWith("edge://") ||
    currentUrl.startsWith("about:") ||
    currentUrl.includes("localhost:8000") ||
    currentUrl.includes("127.0.0.1:8000") ||
    currentUrl.includes("localhost:5173")
  ) {
    return;
  }

  // Avoid injecting twice
  if (document.getElementById("phishguard-shield-badge")) return;

  async function checkWebsiteSafety() {
    try {
      const startTime = performance.now();
      const response = await fetch("http://localhost:8000/predict-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ url: currentUrl }),
      });

      if (!response.ok) return;

      const htmlText = await response.text();
      const latencyMs = Math.round(performance.now() - startTime);

      // Detect classification result
      const isPhishing = htmlText.includes("<strong>Phishing</strong>");
      const isLegitimate = htmlText.includes("<strong>Legitimate</strong>");

      if (!isPhishing && !isLegitimate) return;

      // Extract Gemini/SHAP summary if available
      let explanation = "";
      const summaryMatch = htmlText.match(/<p class="summary">([\s\S]*?)<\/p>/i);
      if (summaryMatch && summaryMatch[1]) {
        explanation = summaryMatch[1]
          .replace(/&#x27;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, "&")
          .trim();
      }

      renderSafetyBadge(isPhishing, latencyMs, explanation);
    } catch (err) {
      // Backend is offline or unreachable - fail silently without disturbing the user
      console.debug("PhishGuard Backend offline on port 8000:", err.message);
    }
  }

  function renderSafetyBadge(isPhishing, latencyMs, explanation) {
    const badge = document.createElement("div");
    badge.id = "phishguard-shield-badge";

    const bgColor = isPhishing ? "#7f1d1d" : "#064e3b";
    const borderColor = isPhishing ? "#ef4444" : "#10b981";
    const shadowColor = isPhishing ? "rgba(239, 68, 68, 0.45)" : "rgba(16, 185, 129, 0.35)";
    const textColor = isPhishing ? "#fecaca" : "#d1fae5";
    const titleText = isPhishing ? "🚨 High-Risk Phishing Detected!" : "🛡️ PhishGuard: Verified Safe";
    const statusTag = isPhishing ? "PHISHING THREAT" : "SAFE / LEGITIMATE";
    const tagBg = isPhishing ? "#dc2626" : "#059669";

    badge.style.cssText = `
      position: fixed !important;
      top: 18px !important;
      right: 18px !important;
      z-index: 2147483647 !important;
      max-width: 360px !important;
      background: ${bgColor} !important;
      border: 1.5px solid ${borderColor} !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 30px ${shadowColor}, 0 2px 8px rgba(0,0,0,0.5) !important;
      color: #ffffff !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      font-size: 13px !important;
      line-height: 1.45 !important;
      padding: 12px 15px !important;
      backdrop-filter: blur(10px) !important;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
      box-sizing: border-box !important;
      text-align: left !important;
    `;

    badge.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
        <span style="font-weight: 800; font-size: 13.5px; color: #ffffff; display: flex; align-items: center; gap: 6px;">
          ${titleText}
        </span>
        <button id="phishguard-close-btn" style="background: none; border: none; color: #cbd5e1; cursor: pointer; font-size: 16px; line-height: 1; padding: 2px 4px; border-radius: 4px;">✕</button>
      </div>

      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background: ${tagBg}; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 999px; letter-spacing: 0.5px;">
          ${statusTag}
        </span>
        <span style="font-size: 11px; color: ${textColor}; opacity: 0.9;">
          Inference: <strong>${latencyMs}ms</strong> • ML Model Active
        </span>
      </div>

      ${
        explanation
          ? `<div id="phishguard-explanation" style="font-size: 11.5px; color: ${textColor}; background: rgba(0,0,0,0.25); padding: 8px 10px; border-radius: 6px; margin-top: 4px; border-left: 3px solid ${borderColor}; max-height: 100px; overflow-y: auto;">
              ${explanation.slice(0, 180)}${explanation.length > 180 ? "..." : ""}
            </div>`
          : `<div style="font-size: 11px; color: ${textColor}; opacity: 0.85;">
              Evaluated 30 real-time DNS, SSL, and DOM heuristic threat signals.
            </div>`
      }
    `;

    document.body.appendChild(badge);

    // Close button logic
    const closeBtn = badge.querySelector("#phishguard-close-btn");
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        badge.remove();
      };
      closeBtn.onmouseenter = () => (closeBtn.style.color = "#ffffff");
      closeBtn.onmouseleave = () => (closeBtn.style.color = "#cbd5e1");
    }

    // Auto-shrink for safe websites after 5 seconds to stay discreet
    if (!isPhishing) {
      setTimeout(() => {
        if (!badge.isConnected) return;
        badge.style.opacity = "0.4";
        badge.style.transform = "scale(0.92)";
      }, 5000);

      badge.onmouseenter = () => {
        badge.style.opacity = "1";
        badge.style.transform = "scale(1)";
      };
      badge.onmouseleave = () => {
        badge.style.opacity = "0.4";
        badge.style.transform = "scale(0.92)";
      };
    }
  }

  // Trigger scan when page is fully ready
  if (document.readyState === "complete") {
    checkWebsiteSafety();
  } else {
    window.addEventListener("load", checkWebsiteSafety);
  }
})();
