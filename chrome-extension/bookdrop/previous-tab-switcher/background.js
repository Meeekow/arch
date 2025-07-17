const STORAGE_KEYS = {
  current: "currentTabId",
  previous: "previousTabId"
};

let cachedCurrentTabId = null;
let cachedPreviousTabId = null;
let suppressNextActivation = false;
const DEBOUNCE_MS = 100;
let lastEventTime = 0;

// Restore memory cache on service worker start
chrome.runtime.onStartup.addListener(async () => {
  const { currentTabId, previousTabId } = await chrome.storage.local.get([
    STORAGE_KEYS.current,
    STORAGE_KEYS.previous
  ]);
  cachedCurrentTabId = currentTabId ?? null;
  cachedPreviousTabId = previousTabId ?? null;
});

// Also restore cache on install or reloaded
(async () => {
  const { currentTabId, previousTabId } = await chrome.storage.local.get([
    STORAGE_KEYS.current,
    STORAGE_KEYS.previous
  ]);
  cachedCurrentTabId = currentTabId ?? null;
  cachedPreviousTabId = previousTabId ?? null;
})();

// Core logic to update state
async function updateTabFocus(newTabId) {
  const now = Date.now();
  if (newTabId === cachedCurrentTabId) return;
  if (now - lastEventTime < DEBOUNCE_MS || suppressNextActivation) {
    suppressNextActivation = false;
    return;
  }

  try {
    const tab = await chrome.tabs.get(newTabId);
    if (tab.incognito) return;

    cachedPreviousTabId = cachedCurrentTabId;
    cachedCurrentTabId = newTabId;
    lastEventTime = now;

    // Persist to storage (asynchronously)
    chrome.storage.local.set({
      [STORAGE_KEYS.current]: cachedCurrentTabId,
      [STORAGE_KEYS.previous]: cachedPreviousTabId
    });
  } catch (err) {
    // Tab may have been closed or inaccessible
  }
}

// When the user activates a new tab
chrome.tabs.onActivated.addListener(({ tabId }) => {
  updateTabFocus(tabId);
});

// When the user switches windows
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  try {
    const [activeTab] = await chrome.tabs.query({ active: true, windowId });
    if (activeTab && !activeTab.incognito) {
      await updateTabFocus(activeTab.id);
    }
  } catch (err) {}
});

// Handle detachments and closures gracefully
chrome.tabs.onDetached.addListener(() => {
  suppressNextActivation = true;
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === cachedCurrentTabId) {
    suppressNextActivation = true;
  }
});

// Handle hotkeys
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "switch-to-previous-tab") {
    if (
      typeof cachedCurrentTabId !== "number" ||
      typeof cachedPreviousTabId !== "number" ||
      cachedCurrentTabId === cachedPreviousTabId
    ) {
      return;
    }

    try {
      const tab = await chrome.tabs.get(cachedPreviousTabId);
      if (!tab.incognito) {
        await chrome.windows.update(tab.windowId, { focused: true });
        await chrome.tabs.update(tab.id, { active: true });

        // Swap and persist
        const temp = cachedCurrentTabId;
        cachedCurrentTabId = cachedPreviousTabId;
        cachedPreviousTabId = temp;

        chrome.storage.local.set({
          [STORAGE_KEYS.current]: cachedCurrentTabId,
          [STORAGE_KEYS.previous]: cachedPreviousTabId
        });
      }
    } catch (err) {
      // Tab was likely closed or inaccessible
    }
  }

  if (command === "copy-current-url") {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || tab.incognito) return;

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (url) => {
          navigator.clipboard.writeText(url).catch(console.error);
        },
        args: [tab.url]
      });
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }
});
