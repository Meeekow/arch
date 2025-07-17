const STORAGE_KEY = 'windowIds';
let windowCache = [];

/**
 * Compare two arrays element-wise for equality.
 * @param {Array} a 
 * @param {Array} b 
 * @returns {boolean}
 */
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Load cache from storage or return in-memory cache
function loadCache() {
  return new Promise((resolve) => {
    if (Array.isArray(windowCache) && windowCache.length >= 0) {
      resolve(windowCache);
      return;
    }
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      windowCache = Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
      resolve(windowCache);
    });
  });
}

// Update cache in memory and persistent storage only if changed
function updateCache(newCache) {
  return new Promise((resolve) => {
    if (arraysEqual(windowCache, newCache)) {
      resolve(); // No changes
      return;
    }
    windowCache = newCache;
    chrome.storage.local.set({ [STORAGE_KEY]: newCache }, () => resolve());
  });
}

// Add window ID to cache if not present and cache size < 2
async function addToCache(windowId) {
  const cache = await loadCache();
  if (!cache.includes(windowId) && cache.length < 2) {
    const newCache = [...cache, windowId];
    await updateCache(newCache);
  }
}

// Remove window ID from cache
async function removeFromCache(windowId) {
  const cache = await loadCache();
  if (cache.includes(windowId)) {
    const newCache = cache.filter(id => id !== windowId);
    await updateCache(newCache);
  }
}

// Initialize cache with currently open windows (max 2)
async function initializeCache() {
  const allWindows = await chrome.windows.getAll({ windowTypes: ['normal'] });
  const ids = allWindows.slice(0, 2).map(w => w.id);
  await updateCache(ids);
}

// Listen for window creation/removal to keep cache updated
chrome.windows.onCreated.addListener(async (window) => {
  if (window.type === 'normal') {
    await addToCache(window.id);
  }
});

chrome.windows.onRemoved.addListener(async (windowId) => {
  await removeFromCache(windowId);
});

// Handle hotkey command
chrome.commands.onCommand.addListener((command) => {
  if (command !== 'detach-tab') return;

  (async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs.length) return;

    const currentTab = tabs[0];
    const currentWindowId = currentTab.windowId;

    // Load cache, trusted to be accurate due to event listeners
    let cache = await loadCache();

    // Fallback initialization if cache is empty or corrupted
    if (cache.length === 0) {
      await initializeCache();
      cache = await loadCache();
    }

    if (cache.length === 1) {
      // Only current window known, create new window and move tab there (do not focus)
      const newWindow = await chrome.windows.create({
        tabId: currentTab.id,
        focused: false,
      });
      await addToCache(newWindow.id);
    } else if (cache.length === 2) {
      // Move tab to other window, activate tab, keep original window focused
      const otherWindowId = cache.find(id => id !== currentWindowId);
      const movedTab = await chrome.tabs.move(currentTab.id, {
        windowId: otherWindowId,
        index: -1,
      });
      await chrome.tabs.update(movedTab.id, { active: true });
      // Not focusing the moved tab’s window keeps current window active
    } else {
      // Unexpected cache state, reset cache
      await initializeCache();
    }
  })();
});

// On extension startup, initialize cache
(async () => {
  await initializeCache();
})();
