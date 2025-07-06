/*let currentTabId = null;
let currentWindowId = null;

let previousTabId = null;
let previousWindowId = null;

// Updates current/previous tracking
function updateTabAndWindow(newTabId, newWindowId) {
  if (newTabId === currentTabId && newWindowId === currentWindowId) return;

  previousTabId = currentTabId;
  previousWindowId = currentWindowId;

  currentTabId = newTabId;
  currentWindowId = newWindowId;

  console.log('Switched Focus →');
  console.log('Previous Tab:', previousTabId, 'Previous Window:', previousWindowId);
  console.log('Current Tab:', currentTabId, 'Current Window:', currentWindowId);
}

// Track tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateTabAndWindow(activeInfo.tabId, activeInfo.windowId);
});

// Track window focus change
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  chrome.tabs.query({ active: true, windowId }, (tabs) => {
    if (tabs.length > 0) {
      const tab = tabs[0];
      updateTabAndWindow(tab.id, tab.windowId);
    }
  });
});

// Handle command: switch-to-previous-tab
chrome.commands.onCommand.addListener((command) => {
  if (command === 'switch-to-previous-tab') {
    if (
      previousTabId != null &&
      previousWindowId != null
    ) {
      chrome.tabs.get(previousTabId, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          console.warn('Previous tab no longer exists.');
          return;
        }

        // Focus the window first
        chrome.windows.update(previousWindowId, { focused: true }, () => {
          // Then activate the tab
          chrome.tabs.update(previousTabId, { active: true });
        });
      });
    } else {
      console.warn('No previous tab to switch to.');
    }
  }
});*/


// Using 'const' for variables that don't get reassigned for better clarity and potential minor V8 optimizations.
const previousTabInfo = { tabId: null, windowId: null };
const currentTabInfo = { tabId: null, windowId: null };

// Centralized logging for easier control and consistency.
const log = (message, ...args) => {
  // In a production environment, you might want to disable console logs.
  // if (process.env.NODE_ENV !== 'production') {
  console.log(`[TabSwitcher] ${message}`, ...args);
  // }
};

// Updates current/previous tracking
function updateTabAndWindow(newTabId, newWindowId) {
  // Using direct property access for clarity and slightly less overhead than destructuring in a hot path.
  if (newTabId === currentTabInfo.tabId && newWindowId === currentTabInfo.windowId) {
    return;
  }

  // Assigning directly to avoid unnecessary intermediate variables.
  previousTabInfo.tabId = currentTabInfo.tabId;
  previousTabInfo.windowId = currentTabInfo.windowId;

  currentTabInfo.tabId = newTabId;
  currentTabInfo.windowId = newWindowId;

  log('Switched Focus →');
  log('Previous Tab:', previousTabInfo);
  log('Current Tab:', currentTabInfo);
}

// Track tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateTabAndWindow(activeInfo.tabId, activeInfo.windowId);
});

// Track window focus change
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

  try {
    // Using async/await for cleaner asynchronous code and error handling.
    // chrome.tabs.query returns a Promise in Manifest V3 (and newer Chrome versions).
    const tabs = await chrome.tabs.query({ active: true, windowId });
    if (tabs.length > 0) {
      const tab = tabs[0];
      updateTabAndWindow(tab.id, tab.windowId);
    }
  } catch (error) {
    log('Error querying tabs on window focus change:', error);
  }
});

// Handle command: switch-to-previous-tab
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'switch-to-previous-tab') {
    const { tabId: prevTabId, windowId: prevWindowId } = previousTabInfo;

    if (prevTabId != null && prevWindowId != null) {
      try {
        // Check if the previous tab still exists and is not discarded before attempting to activate.
        // This can prevent errors if the tab was closed or discarded.
        const tab = await chrome.tabs.get(prevTabId);

        // Check if the tab object is valid and not discarded.
        // Discarded tabs can still exist but might not be activatable without reloading.
        if (!tab || tab.discarded) {
          log('Previous tab no longer exists or is discarded. Cannot switch.', { tab, prevTabId });
          // Optionally, you might want to clear previousTabInfo here if it's truly gone.
          // previousTabInfo.tabId = null;
          // previousTabInfo.windowId = null;
          return;
        }

        // Focus the window first, then activate the tab.
        // Awaiting the window update ensures the window is focused before attempting to activate the tab within it.
        await chrome.windows.update(prevWindowId, { focused: true });
        await chrome.tabs.update(prevTabId, { active: true });
        log('Switched to previous tab:', prevTabId);
      } catch (error) {
        // Catch specific errors if possible (e.g., tab not found error code).
        // The chrome.tabs.get might throw an error if the tab ID is invalid.
        log('Failed to switch to previous tab:', error);
      }
    } else {
      log('No previous tab to switch to.');
    }
  }
});

// Initialize current tab and window on extension startup.
// This ensures that `currentTabInfo` and `previousTabInfo` are correctly populated
// from the very beginning, even if no tab activation or window focus change occurs yet.
async function initializeCurrentTab() {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, lastAudible: true }); // lastAudible might be a more robust way to get "the" active tab
    if (activeTab) {
      updateTabAndWindow(activeTab.id, activeTab.windowId);
    } else {
      log('No active tab found on initialization.');
    }
  } catch (error) {
    log('Error during initialization:', error);
  }
}

// Call the initialization function when the background script starts.
// For Manifest V3, background scripts are service workers, so this will run on startup.
initializeCurrentTab();