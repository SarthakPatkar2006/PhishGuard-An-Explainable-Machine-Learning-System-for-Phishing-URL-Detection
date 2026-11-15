// PhishGuard Pre-Navigation Interceptor & API Gateway (Background Service Worker)

// In-memory cache for the session so repeated clicks on the same domain don't re-query
const sessionDomainCache = new Map();

// Helper to query PhishGuard FastAPI backend using extension host permissions (bypasses webpage CSP/Mixed-Content)
async function checkUrlWithBackend(targetUrl) {
  const startTime = performance.now();
  try {
    const response = await fetch("http://localhost:8000/predict-url", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url: targetUrl }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const htmlText = await response.text();
    const latencyMs = Math.round(performance.now() - startTime);

    const isPhishing = htmlText.includes("<strong>Phishing</strong>");
    const isLegitimate = htmlText.includes("<strong>Legitimate</strong>");

    let summary = "";
    const match = htmlText.match(/<p class="summary">([\s\S]*?)<\/p>/i);
    if (match && match[1]) {
      summary = match[1]
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .trim();
    }

    const result = {
      success: true,
      isPhishing,
      isLegitimate,
      latencyMs,
      summary,
    };

    return result;
  } catch (err) {
    console.debug("Backend unreachable on port 8000:", err.message);
    return { success: false, error: err.message };
  }
}

// 1. Intercept navigation before malicious page can load
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;

  const targetUrl = details.url;
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

    // Fast-path known authoritative domains
    if (
      hostname.endsWith("whatsapp.com") ||
      hostname.endsWith("google.com") ||
      hostname.endsWith("github.com") ||
      hostname.endsWith("wikipedia.org") ||
      hostname.endsWith("youtube.com")
    ) {
      return;
    }

    const isBypassed = await getBypassState(targetUrl);
    if (isBypassed) return;

    const result = await checkUrlWithBackend(targetUrl);
    if (result.success && result.isPhishing) {
      // Immediate Navigation Block
      const blockedPageUrl = chrome.runtime.getURL(
        `blocked.html?url=${encodeURIComponent(targetUrl)}&summary=${encodeURIComponent(result.summary || "")}`
      );
      chrome.tabs.update(details.tabId, { url: blockedPageUrl });
    }
  } catch (e) {
    console.debug("Navigation check error:", e);
  }
});

// 2. Handle API requests from content.js (avoids mixed content issues on HTTPS pages)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "CHECK_URL") {
    checkUrlWithBackend(message.url).then((res) => {
      sendResponse(res);
    });
    return true; // Keep asynchronous channel open
  }

  if (message.action === "allow_bypass" && message.url) {
    chrome.storage.session.set({ [message.url]: true }, () => {
      sendResponse({ status: "bypassed" });
    });
    return true;
  }
});

function getBypassState(url) {
  return new Promise((resolve) => {
    chrome.storage.session.get([url], (result) => {
      resolve(result[url] === true);
    });
  });
}
