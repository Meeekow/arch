// let currentTab = null;
// let previousTab = null;

// // Helper function to update tab tracking
// async function updateTabTracking(tab) {
//   if (!tab || tab.incognito) return;

//   // If the tab is already currentTab, no update needed
//   if (currentTab?.id === tab.id && currentTab?.windowId === tab.windowId) {
//     return;
//   }

//   previousTab = currentTab;
//   currentTab = { id: tab.id, windowId: tab.windowId };
// }

// // Listen for tab activation (user switches tabs)
// chrome.tabs.onActivated.addListener(async (activeInfo) => {
//   try {
//     const tab = await chrome.tabs.get(activeInfo.tabId);
//     await updateTabTracking(tab);
//   } catch (e) {
//     console.error("Error handling tab activation:", e);
//   }
// });

// // Listen for window focus changes (user switches windows)
// chrome.windows.onFocusChanged.addListener(async (windowId) => {
//   try {
//     // windowId can be chrome.windows.WINDOW_ID_NONE (-1) when all Chrome windows lost focus
//     if (windowId === chrome.windows.WINDOW_ID_NONE) return;

//     const tabs = await chrome.tabs.query({ windowId, active: true });
//     if (tabs.length === 0) return;

//     const activeTab = tabs[0];
//     await updateTabTracking(activeTab);
//   } catch (e) {
//     console.error("Error handling window focus change:", e);
//   }
// });

// // Toggle between currentTab and previousTab when shortcut pressed
// chrome.commands.onCommand.addListener(async (command) => {
//   if (command === "toggle-tabs" && previousTab) {
//     try {
//       // Activate previous tab and focus its window
//       await chrome.tabs.update(previousTab.id, { active: true });
//       await chrome.windows.update(previousTab.windowId, { focused: true });

//       // Swap current and previous tabs in memory
//       const temp = currentTab;
//       currentTab = previousTab;
//       previousTab = temp;
//     } catch (e) {
//       console.error("Error toggling tabs:", e);
//     }
//   }
// });


let currentTab = null;
let previousTab = null;

// Helper function to update tab tracking
async function updateTabTracking(tab) {
  if (!tab || tab.incognito) return;

  if (currentTab?.id === tab.id && currentTab?.windowId === tab.windowId) {
    return;
  }

  previousTab = currentTab;
  currentTab = { id: tab.id, windowId: tab.windowId };
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await updateTabTracking(tab);
  } catch (e) {
    console.error("Error handling tab activation:", e);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  try {
    if (windowId === chrome.windows.WINDOW_ID_NONE) return;

    const tabs = await chrome.tabs.query({ windowId, active: true });
    if (tabs.length === 0) return;

    const activeTab = tabs[0];
    await updateTabTracking(activeTab);
  } catch (e) {
    console.error("Error handling window focus change:", e);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-tabs" && previousTab) {
    try {
      await chrome.tabs.update(previousTab.id, { active: true });
      await chrome.windows.update(previousTab.windowId, { focused: true });

      const temp = currentTab;
      currentTab = previousTab;
      previousTab = temp;
    } catch (e) {
      console.error("Error toggling tabs:", e);
    }
  } else if (command === "copy-current-url") {
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
