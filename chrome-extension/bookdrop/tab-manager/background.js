let currentTab = null;
let previousTab = null;

// Track tab activation
chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    updateTabHistory(tab);
  } catch (e) {
    // Tab may not exist
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  try {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) updateTabHistory(tab);
  } catch (e) {
    // Ignore
  }
});

// Update in-memory tab history
function updateTabHistory(newTab) {
  if (
    currentTab &&
    newTab.id === currentTab.id &&
    newTab.windowId === currentTab.windowId
  ) return;

  previousTab = currentTab;
  currentTab = { id: newTab.id, windowId: newTab.windowId };
}

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "go-back-tab") {
    try {
      if (previousTab) {
        try {
          // Check if previousTab still exists
          await chrome.tabs.get(previousTab.id);

          // Switch to it
          await chrome.windows.update(previousTab.windowId, { focused: true });
          await chrome.tabs.update(previousTab.id, { active: true });

          // Swap current and previous
          const temp = currentTab;
          currentTab = previousTab;
          previousTab = temp;

          return;
        } catch {
          // previousTab is gone — fallback
        }
      }

      // Fallback: find a tab containing "youtube.com"
      const tabs = await chrome.tabs.query({});
      const ytTab = tabs.find(t => t.url && t.url.includes("https://mail.google.com/mail/u/0/d/AEoRXRTvM8BT67em7TPEPDV6mvklLaNnyQmNvAeHveJlqDlLEl7H/#inbox"));

      if (ytTab) {
        // Before switching: get fresh current active tab
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab) {
          previousTab = { id: activeTab.id, windowId: activeTab.windowId };
        }

        // Switch to fallback tab
        await chrome.windows.update(ytTab.windowId, { focused: true });
        await chrome.tabs.update(ytTab.id, { active: true });

        currentTab = { id: ytTab.id, windowId: ytTab.windowId };
      } else {
        console.warn("No previous tab and no YouTube tab found.");
      }
    } catch (e) {
      console.error("Error in go-back-tab:", e.message);
    }
  }

  else if (command === "copy-current-url") {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) return;

      // Inject script into current tab to copy its URL
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [tab.url],
        func: (url) => {
          navigator.clipboard.writeText(url).catch(err => {
            console.error("Clipboard write failed:", err);
          });
        },
      });
    } catch (e) {
      console.error("Error copying URL:", e.message);
    }
  }

  else if (command === "detach-or-reattach-tab") {
    try {
      const [current] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!current) return;

      const allWindows = await chrome.windows.getAll({ populate: false });

      if (allWindows.length === 1) {
        // Only one window: detach tab
        const newWindow = await chrome.windows.create({ tabId: current.id });

        // Focus new window and tab
        await chrome.windows.update(newWindow.id, { focused: true });
        await chrome.tabs.update(current.id, { active: true });
      } else {
        // Move tab to another window
        const targetWindow = allWindows.find(w => w.id !== current.windowId);
        if (!targetWindow) return;

        await chrome.tabs.move(current.id, {
          windowId: targetWindow.id,
          index: -1,
        });

        await chrome.windows.update(targetWindow.id, { focused: true });
        await chrome.tabs.update(current.id, { active: true });
      }
    } catch (e) {
      console.error("Error detaching/reattaching tab:", e.message);
    }
  }
});

// Clean up state when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (currentTab?.id === tabId) currentTab = null;
  if (previousTab?.id === tabId) previousTab = null;
});
