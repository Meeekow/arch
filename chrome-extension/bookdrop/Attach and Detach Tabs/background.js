const tabMemory = new Map(); // tab.id => { originalWindowId, leftTabId, rightTabId }

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.id || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
    return;
  }

  const currentWindow = await chrome.windows.get(tab.windowId);

  if (command === "detach-tab") {
    const allTabs = await chrome.tabs.query({ windowId: tab.windowId });
    const index = tab.index;

    const leftTab = allTabs.find(t => t.index === index - 1);
    const rightTab = allTabs.find(t => t.index === index + 1);

    tabMemory.set(tab.id, {
      originalWindowId: tab.windowId,
      leftTabId: leftTab?.id ?? null,
      rightTabId: rightTab?.id ?? null
    });

    const allWindows = await chrome.windows.getAll({ populate: false, windowTypes: ["normal"] });
    const targetWindow = allWindows.find(w => w.id !== currentWindow.id);

    try {
      if (targetWindow) {
        await chrome.tabs.move(tab.id, { windowId: targetWindow.id, index: -1 });
        await chrome.windows.update(targetWindow.id, { focused: true });
        await chrome.tabs.update(tab.id, { active: true });
      } else {
        await chrome.windows.create({
          tabId: tab.id,
          focused: true,
          type: "normal"
        });
      }
    } catch (err) {
      console.error("Failed to detach tab:", err);
    }
  }

  if (command === "reattach-tab") {
    const memory = tabMemory.get(tab.id);
    if (!memory) return;

    try {
      const tabsInOriginalWindow = await chrome.tabs.query({ windowId: memory.originalWindowId });
      let targetIndex = 0;

      const leftIndex = tabsInOriginalWindow.find(t => t.id === memory.leftTabId)?.index;
      const rightIndex = tabsInOriginalWindow.find(t => t.id === memory.rightTabId)?.index;

      if (leftIndex != null) {
        targetIndex = leftIndex + 1;
      } else if (rightIndex != null) {
        targetIndex = rightIndex;
      } else {
        targetIndex = tabsInOriginalWindow.length;
      }

      await chrome.tabs.move(tab.id, {
        windowId: memory.originalWindowId,
        index: targetIndex
      });

      await chrome.windows.update(memory.originalWindowId, { focused: true });
      await chrome.tabs.update(tab.id, { active: true });

      tabMemory.delete(tab.id);
    } catch (err) {
      console.error("Failed to reattach tab between neighbors:", err);
    }
  }
});

// ✅ CLEANUP: Remove stale entries when tabs are closed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (tabMemory.has(tabId)) {
    tabMemory.delete(tabId);
    console.log(`Cleaned up closed tab ${tabId} from memory.`);
  }
});

// onAttached captures cross-window moves
// This cleans up right then — preventing stale reattachment.
chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  const memory = tabMemory.get(tabId);
  if (!memory) return;

  if (attachInfo.newWindowId === memory.originalWindowId) {
    tabMemory.delete(tabId);
    console.log(`Tab ${tabId} was manually moved back to its original window. Cleaned from memory.`);
  }
});