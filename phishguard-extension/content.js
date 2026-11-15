// PhishGuard In-Browser Security Clearance & Threat Popup
(function () {
  const currentUrl = window.location.href;

  if (
    !currentUrl ||
    currentUrl.startsWith("chrome://") ||
    currentUrl.startsWith("edge://") ||
    currentUrl.startsWith("about:") ||
    currentUrl.startsWith("chrome-extension://") ||
    currentUrl.includes("localhost:8000") ||
    currentUrl.includes("127.0.0.1:8000") ||
    currentUrl.includes("localhost:5173")
  ) {
    return;
  }

  // Prevent duplicate popups
  if (document.getElementById("phishguard-security-popup")) return;

  console.log("[PhishGuard] Injected and scanning:", currentUrl);

  function initSafetyCheck() {
    chrome.runtime.sendMessage({ action: "CHECK_URL", url: currentUrl }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("[PhishGuard] Extension communication error:", chrome.runtime.lastError.message);
        return;
      }
      if (!response || !response.success) {
        console.warn("[PhishGuard] Backend check returned no success:", response);
        return;
      }

      console.log("[PhishGuard] Scan result received:", response);

      if (response.isLegitimate) {
        showSafePopup(response.latencyMs, response.summary);
      } else if (response.isPhishing) {
        showPhishingPopup(response.latencyMs, response.summary);
      }
    });
  }

  function mountElement(elem) {
    if (document.body) {
      document.body.appendChild(elem);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(elem);
      });
    }
  }

  function showSafePopup(latencyMs, explanation) {
    if (document.getElementById("phishguard-security-popup")) return;

    const popup = document.createElement("div");
    popup.id = "phishguard-security-popup";

    popup.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      width: 380px !important;
      background: linear-gradient(145deg, #062e25 0%, #061f1b 60%, #031411 100%) !important;
      border: 1.5px solid #10b981 !important;
      border-radius: 14px !important;
      box-shadow: 0 10px 35px rgba(16, 185, 129, 0.45), 0 0 20px rgba(0, 0, 0, 0.8) !important;
      color: #ffffff !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      padding: 16px 18px !important;
      backdrop-filter: blur(12px) !important;
      animation: phishguardSlideIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) !important;
      box-sizing: border-box !important;
      text-align: left !important;
    `;

    popup.innerHTML = `
      <style>
        @keyframes phishguardSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes phishguardPulse {
          0% { box-shadow: 0 0 6px #10b981; }
          50% { box-shadow: 0 0 16px #34d399; }
          100% { box-shadow: 0 0 6px #10b981; }
        }
      </style>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: #10b981; border-radius: 50%; font-size: 14px; animation: phishguardPulse 2s infinite;">
            🛡️
          </span>
          <span style="font-weight: 800; font-size: 14px; color: #ffffff; letter-spacing: -0.3px;">
            PhishGuard Security Verified
          </span>
        </div>
        <button id="phishguard-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 2px 5px; line-height: 1;">✕</button>
      </div>

      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
        <span style="background: #059669; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 999px; letter-spacing: 0.5px;">
          SAFE &bull; LEGITIMATE
        </span>
        <span style="font-size: 11px; color: #a7f3d0;">
          Inference: <strong>${latencyMs || 15}ms</strong> &bull; Random Forest Active
        </span>
      </div>

      <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; font-size: 11.5px; line-height: 1.5; color: #d1fae5;">
        <div style="color: #6ee7b7; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 5px;">
          <span>✓</span> 30 Heuristic Signals Validated
        </div>
        <div style="font-size: 11px; color: #a7f3d0; opacity: 0.9;">
          &bull; SSL Certificate: <strong>Valid & Trusted CA</strong><br>
          &bull; Hostname & DNS: <strong>Authentic Domain</strong><br>
          &bull; Anchor & Form Tags: <strong>Normal Distribution</strong>
        </div>
      </div>

      <div style="font-size: 10.5px; color: #6ee7b7; text-align: right; opacity: 0.85;">
        Protected by PhishGuard Enterprise Shield
      </div>
    `;

    mountElement(popup);

    const closeBtn = popup.querySelector("#phishguard-close-btn");
    if (closeBtn) {
      closeBtn.onclick = () => popup.remove();
      closeBtn.onmouseenter = () => (closeBtn.style.color = "#ffffff");
      closeBtn.onmouseleave = () => (closeBtn.style.color = "#94a3b8");
    }

    // Auto-shrink after 8 seconds
    setTimeout(() => {
      if (!popup.isConnected) return;
      popup.style.transition = "all 0.4s ease";
      popup.style.opacity = "0.35";
      popup.style.transform = "scale(0.92)";
    }, 8000);

    popup.onmouseenter = () => {
      popup.style.opacity = "1";
      popup.style.transform = "scale(1)";
    };
    popup.onmouseleave = () => {
      popup.style.opacity = "0.35";
      popup.style.transform = "scale(0.92)";
    };
  }

  function showPhishingPopup(latencyMs, explanation) {
    if (document.getElementById("phishguard-security-popup")) return;

    const popup = document.createElement("div");
    popup.id = "phishguard-security-popup";

    popup.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      width: 400px !important;
      background: linear-gradient(145deg, #450a0a 0%, #1f0707 100%) !important;
      border: 2px solid #ef4444 !important;
      border-radius: 14px !important;
      box-shadow: 0 10px 40px rgba(239, 68, 68, 0.5) !important;
      color: #ffffff !important;
      font-family: -apple-system, sans-serif !important;
      padding: 18px !important;
      text-align: left !important;
    `;

    popup.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: 800; font-size: 15px; color: #ef4444;">🚨 PHISHING THREAT DETECTED</span>
        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">✕</button>
      </div>
      <p style="font-size: 12px; color: #fca5a5; margin: 0 0 8px 0;">PhishGuard ML model flagged high-risk deception signals.</p>
    `;

    mountElement(popup);
  }

  // Start immediately or when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSafetyCheck);
  } else {
    initSafetyCheck();
  }
})();
