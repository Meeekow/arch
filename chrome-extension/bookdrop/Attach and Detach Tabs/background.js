const tabStateMap = new Map(); // tabId → { originalWindowId, positionValue }
const livePositionMap = new Map(); // windowId → { tabId → positionValue }

// Helper to get or create position map for a window
function getOrCreatePositionMap(windowId) {
  if (!livePositionMap.has(windowId)) {
    livePositionMap.set(windowId, {});
  }
  return livePositionMap.get(windowId);
}

function generatePositionValue() {
  return Math.floor(Math.random() * 9000) + 1000; // 1000–9999
}

function generateMidpoint(a, b) {
  return Math.floor((a + b) / 2);
}

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id || !tab.windowId) return;

  if (command === 'detach-tab') {
    if (!tabStateMap.has(tab.id)) {
      const tabs = await chrome.tabs.query({ windowId: tab.windowId });

      const posMap = getOrCreatePositionMap(tab.windowId);
      if (!posMap[tab.id]) {
        let current = 1000;
        for (const t of tabs) {
          if (!posMap[t.id]) {
            posMap[t.id] = current;
            current += 1000;
          }
        }
      }

      const positionValue = posMap[tab.id];

      tabStateMap.set(tab.id, {
        originalWindowId: tab.windowId,
        positionValue
      });

      delete posMap[tab.id];

      const existingDetachedWindow = await findDetachedWindow(tab.id);
      if (existingDetachedWindow) {
        await chrome.tabs.move(tab.id, { windowId: existingDetachedWindow.id, index: -1 });
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(existingDetachedWindow.id, { focused: true });
      } else {
        const newWin = await chrome.windows.create({ tabId: tab.id, focused: true });
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(newWin.id, { focused: true });
      }
    }
  }

  if (command === 'reattach-tab') {
    const state = tabStateMap.get(tab.id);
    if (!state) return;

    try {
      const { originalWindowId, positionValue } = state;
      const tabs = await chrome.tabs.query({ windowId: originalWindowId });

      const posMap = getOrCreatePositionMap(originalWindowId);
      const sortedTabs = tabs
        .map(t => ({ tab: t, pos: posMap[t.id] }))
        .filter(t => typeof t.pos === 'number')
        .sort((a, b) => a.pos - b.pos);

      let insertIndex = 0;
      for (let i = 0; i < sortedTabs.length; i++) {
        if (positionValue < sortedTabs[i].pos) {
          insertIndex = sortedTabs[i].tab.index;
          break;
        }
        insertIndex = sortedTabs[i].tab.index + 1;
      }

      await chrome.tabs.move(tab.id, {
        windowId: originalWindowId,
        index: insertIndex
      });

      await chrome.windows.update(originalWindowId, { focused: true });
      await chrome.tabs.update(tab.id, { active: true });

      getOrCreatePositionMap(originalWindowId)[tab.id] = positionValue;
      tabStateMap.delete(tab.id);
    } catch (err) {
      tabStateMap.delete(tab.id);
    }
  }
});

// Track manually dragged (detached) tabs
chrome.tabs.onDetached.addListener(async (tabId, detachInfo) => {
  if (tabStateMap.has(tabId)) return;

  const { oldWindowId } = detachInfo;
  const posMap = livePositionMap.get(oldWindowId);
  if (!posMap) return;

  const positionValue = posMap[tabId];
  if (typeof positionValue !== 'number') return;

  tabStateMap.set(tabId, {
    originalWindowId: oldWindowId,
    positionValue
  });

  delete posMap[tabId];
});

// Track manually reattached tabs (to original window) and clean up
chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  const state = tabStateMap.get(tabId);
  if (!state) return;

  const { originalWindowId, positionValue } = state;
  const { newWindowId } = attachInfo;

  if (newWindowId === originalWindowId) {
    tabStateMap.delete(tabId);
    getOrCreatePositionMap(originalWindowId)[tabId] = positionValue;
  }
});

// Remove tab state when closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabStateMap.delete(tabId);
  for (const posMap of livePositionMap.values()) {
    delete posMap[tabId];
  }
});

// Clean up state when original window is closed
chrome.windows.onRemoved.addListener((windowId) => {
  livePositionMap.delete(windowId);
  for (const [tabId, state] of tabStateMap.entries()) {
    if (state.originalWindowId === windowId) {
      tabStateMap.delete(tabId);
    }
  }
});

// Finds another detached tab’s window to group with
async function findDetachedWindow(currentTabId) {
  const windows = await chrome.windows.getAll({ populate: true });
  for (const win of windows) {
    if (win.tabs.some(tab => tab.id !== currentTabId && tabStateMap.has(tab.id))) {
      return win;
    }
  }
  return null;
}