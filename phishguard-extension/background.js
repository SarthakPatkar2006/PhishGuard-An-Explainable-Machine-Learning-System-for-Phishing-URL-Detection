// PhishGuard Pre-Navigation Interceptor (Background Service Worker)

// Cache verified safe domains to ensure sub-millisecond navigation for repeat visits
const verifiedSafeCache = new Set(["google.com", "www.google.com", "github.com", "localhost"]);
const activeChecks = new Map();

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only intercept main browser frame navigations (frameId 0), not sub-iframes or images
  if (details.frameId !== 0) return;

  const targetUrl = details.url;

  // Ignore internal browser schemes, extension pages, and local dev ports
  if (
    !targetUrl ||
    targetUrl.startsWith("chrome://") ||
    targetUrl.startsWith("edge://") ||
    targetUrl.startsWith("about:") ||
    targetUrl.startsWith("chrome-extension://") ||
    targetUrl.includes("localhost:8000") ||
    targetUrl.includes("127.0.0.1:8000") ||
    targetUrl.includes("localhost:5173")
  ) {
    return;
  }

  try {
    const urlObj = new URL(targetUrl);
    const hostname = urlObj.hostname.toLowerCase();

    // Fast-path: If domain is already verified in this session, allow instantly
    if (verifiedSafeCache.has(hostname)) {
      return;
    }

    // Check if user clicked "Proceed Anyway" for this specific URL
    const proceedBypass = await getBypassState(targetUrl);
    if (proceedBypass) {
      return;
    }

    // Send pre-navigation check to PhishGuard Backend
    const response = await fetch("http://localhost:8000/predict-url", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url: targetUrl }),
    });

    if (!response.ok) return;

    const htmlText = await response.text();
    const isPhishing = htmlText.includes("<strong>Phishing</strong>");

    if (isPhishing) {
      // Extract Gemini/SHAP summary if present
      let summary = "";
      const match = htmlText.match(/<p class="summary">([\s\S]*?)<\/p>/i);
      if (match && match[1]) {
        summary = match[1].replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim();
      }

      // PREVENT NAVIGATION: Redirect tab immediately to full-screen safety warning page
      const blockedPageUrl = chrome.runtime.getURL(
        `blocked.html?url=${encodeURIComponent(targetUrl)}&summary=${encodeURIComponent(summary)}`
      );

      chrome.tabs.update(details.tabId, { url: blockedPageUrl });
    } else {
      // Verified Safe: Add to session cache so subsequent clicks on this site are instant
      verifiedSafeCache.add(hostname);
    }
  } catch (err) {
    // Backend offline or error: fail open so browsing is not broken
    console.debug("PhishGuard background check error:", err.message);
  }
});

// Helper to check temporary user override
function getBypassState(url) {
  return new Promise((resolve) => {
    chrome.storage.session.get([url], (result) => {
      resolve(result[url] === true);
    });
  });
}

// Listen for "Proceed Anyway" messages from blocked.html
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "allow_bypass" && message.url) {
    chrome.storage.session.set({ [message.url]: true }, () => {
      sendResponse({ status: "bypassed" });
    });
    return true;
  }
});
