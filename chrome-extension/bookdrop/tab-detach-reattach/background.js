// A map to store detached tab information.
// Key: tabId, Value: { originalWindowId, originalIndex, precedingTabId, followingTabId, timestamp, detachedWindowId }
let detachedTabsMemory = {};

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "detach-tab") {
    await detachTab();
  } else if (command === "reattach-tab") {
    await reattachTab();
  }
});

/**
 * Helper function to update the preceding and following tab IDs for a detached tab.
 * This function is called when tabs in the original window change.
 * @param {number} detachedTabId The ID of the tab that was detached.
 * @param {number} originalWindowId The ID of the window the tab was detached from.
 * @param {Array<Object>} currentTabsInOriginalWindow The pre-queried list of tabs in the original window.
 */
async function updateDetachedTabNeighbors(detachedTabId, originalWindowId, currentTabsInOriginalWindow) {
  const tabInfo = detachedTabsMemory[detachedTabId];
  if (!tabInfo) {
    console.log(`Detached tab ${detachedTabId} not found in memory for neighbor update.`);
    return;
  }

  const originalIndex = tabInfo.originalIndex;
  // Use the passed-in list of tabs, which is already sorted
  const tabsInOriginalWindow = currentTabsInOriginalWindow;

  let newPrecedingTabId = null;
  let newFollowingTabId = null;

  // Find the new preceding tab: Scan backwards from the original index position
  for (let i = originalIndex - 1; i >= 0; i--) {
    const potentialPrecedingTab = tabsInOriginalWindow[i];
    if (potentialPrecedingTab && potentialPrecedingTab.id !== detachedTabId) { // Ensure it's a valid tab and not the detached one itself
      newPrecedingTabId = potentialPrecedingTab.id;
      break;
    }
  }

  // Find the new following tab: Scan forwards from the original index position (where the detached tab used to be)
  for (let i = originalIndex; i < tabsInOriginalWindow.length; i++) {
    const potentialFollowingTab = tabsInOriginalWindow[i];
    if (potentialFollowingTab && potentialFollowingTab.id !== detachedTabId) { // Ensure it's a valid tab and not the detached one itself
      newFollowingTabId = potentialFollowingTab.id;
      break;
    }
  }

  // Update the detached tab's record if neighbors have changed
  if (tabInfo.precedingTabId !== newPrecedingTabId || tabInfo.followingTabId !== newFollowingTabId) {
    tabInfo.precedingTabId = newPrecedingTabId;
    tabInfo.followingTabId = newFollowingTabId;
    await chrome.storage.session.set({ 'detachedTabs': detachedTabsMemory });
    console.log(`Updated neighbors for detached tab ${detachedTabId}. New preceding: ${newPrecedingTabId}, New following: ${newFollowingTabId}`);
  }
}

/**
 * Detaches the currently active tab into a new window or an existing other window.
 */
async function detachTab() {
  try {
    // 1. Get the currently active tab
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!currentTab) {
      console.log("No active tab found to detach.");
      return;
    }

    const originalTabId = currentTab.id;
    const originalWindowId = currentTab.windowId;
    const originalIndex = currentTab.index;

    // Get all tabs in the original window to find preceding/following tabs
    const allTabsInOriginalWindow = await chrome.tabs.query({ windowId: originalWindowId });

    let precedingTabId = null;
    let followingTabId = null;

    if (originalIndex > 0) {
      precedingTabId = allTabsInOriginalWindow[originalIndex - 1]?.id || null;
    }
    if (originalIndex < allTabsInOriginalWindow.length - 1) {
      followingTabId = allTabsInOriginalWindow[originalIndex + 1]?.id || null;
    }

    // Determine the target window for detachment
    let targetWindowId;
    let newWindowCreated = false;

    // Get all open windows
    const allWindows = await chrome.windows.getAll({ populate: false });
    const otherWindows = allWindows.filter(win => win.id !== originalWindowId);

    if (otherWindows.length > 0) {
      // If there's another window, use the first one found as the target
      targetWindowId = otherWindows[0].id;
      console.log(`Detaching tab to existing window: ${targetWindowId}`);
      // Move the tab to the target window
      // We move it to the end of the target window for simplicity, then activate it.
      await chrome.tabs.move(originalTabId, { windowId: targetWindowId, index: -1 }); // -1 means append to the end
    } else {
      // If no other window exists, create a new one with the tab directly
      // By specifying tabId, Chrome moves the tab directly without creating an empty one first.
      const newWindow = await chrome.windows.create({ type: 'normal', state: 'normal', tabId: originalTabId });
      targetWindowId = newWindow.id;
      newWindowCreated = true;
      console.log(`No other window found. Creating new window: ${targetWindowId} with tab ${originalTabId}.`);
    }

    // Activate the moved/created tab in its new window
    await chrome.tabs.update(originalTabId, { active: true });

    // 3. Store the detachment information in session storage
    const storedData = await chrome.storage.session.get('detachedTabs');
    const currentDetachedTabs = storedData.detachedTabs || {};

    currentDetachedTabs[originalTabId] = {
      originalWindowId: originalWindowId,
      originalIndex: originalIndex,
      precedingTabId: precedingTabId,
      followingTabId: followingTabId,
      timestamp: Date.now(), // Helps identify the most recent detached tab
      detachedWindowId: newWindowCreated ? targetWindowId : null // Only store if a new window was created for it
    };

    await chrome.storage.session.set({ 'detachedTabs': currentDetachedTabs });
    detachedTabsMemory = currentDetachedTabs; // Update local memory

    console.log(`Tab ${originalTabId} detached. Stored data:`, currentDetachedTabs[originalTabId]);

    // Optional: Close the original window if it becomes empty and was the only tab
    const remainingTabsInOriginalWindow = await chrome.tabs.query({ windowId: originalWindowId });
    if (remainingTabsInOriginalWindow.length === 0) {
        await chrome.windows.remove(originalWindowId);
        console.log(`Original window ${originalWindowId} closed as it became empty.`);
    }

  } catch (error) {
    console.error("Error detaching tab:", error);
  }
}

/**
 * Reattaches the currently focused tab if it was previously detached by this extension.
 */
async function reattachTab() {
  try {
    // Ensure our local memory is up-to-date with session storage
    const storedData = await chrome.storage.session.get('detachedTabs');
    detachedTabsMemory = storedData.detachedTabs || {};
    console.log("Reattach initiated. Detached tabs in memory:", detachedTabsMemory);

    // 1. Get the currently active tab
    const [currentFocusedTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!currentFocusedTab) {
      console.log("No active tab found to reattach.");
      return;
    }

    const tabToReattachId = currentFocusedTab.id;
    const tabInfo = detachedTabsMemory[tabToReattachId];

    if (!tabInfo) {
      console.log(`Currently focused tab ${tabToReattachId} is not a detached tab managed by this extension.`);
      return;
    }

    console.log(`Attempting to reattach currently focused tab ${tabToReattachId} with info:`, tabInfo);

    const { originalWindowId, originalIndex, precedingTabId, followingTabId, detachedWindowId } = tabInfo;

    // Check if the tab to reattach still exists (e.g., user didn't close it)
    let reattachTargetTab;
    try {
        // Use chrome.tabs.get() for single tab lookup
        reattachTargetTab = await chrome.tabs.get(tabToReattachId);
        if (!reattachTargetTab) {
            throw new Error("Tab not found after get().");
        }
        console.log(`Found tab to reattach: ${reattachTargetTab.title} (ID: ${reattachTargetTab.id})`);
    } catch (e) {
        console.error(`Tab with ID ${tabToReattachId} not found. Perhaps it was closed manually. Error:`, e);
        // Clean up from memory if tab is gone
        delete detachedTabsMemory[tabToReattachId];
        await chrome.storage.session.set({ 'detachedTabs': detachedTabsMemory });
        return;
    }

    // Determine the target window.
    // As per user requirement, original window is assumed never to close during a session.
    let targetWindowId = originalWindowId;
    let originalWindowExists = true; // Assume true based on user's "never close" assumption
    try {
        await chrome.windows.get(originalWindowId); // Still good to verify existence
        console.log(`Original window ${originalWindowId} exists.`);
    } catch (e) {
        originalWindowExists = false;
        console.warn(`Original window ${originalWindowId} no longer exists (unexpected). Reattaching to current active window.`);
        const currentWindow = await chrome.windows.getCurrent();
        targetWindowId = currentWindow.id;
        console.log(`New target window ID: ${targetWindowId}`);
    }

    // Get all tabs in the target window to determine the reattachment index
    const tabsInTargetWindow = await chrome.tabs.query({ windowId: targetWindowId });
    // Sort tabs by index to ensure correct positional lookup
    tabsInTargetWindow.sort((a, b) => a.index - b.index);
    console.log(`Tabs in target window ${targetWindowId}:`, tabsInTargetWindow.map(t => ({ id: t.id, index: t.index, title: t.title })));

    let calculatedIndex = -1; // Default to append at the end

    // Prioritize preceding/following tab IDs for robustness
    if (originalWindowExists) { // Only use anchors if the original window still exists
        console.log(`Original window exists. Checking anchors: precedingTabId=${precedingTabId}, followingTabId=${followingTabId}`);

        // Try to find position relative to preceding tab
        if (precedingTabId) {
            const precedingTabIndex = tabsInTargetWindow.findIndex(tab => tab.id === precedingTabId);
            if (precedingTabIndex !== -1) {
                calculatedIndex = precedingTabIndex + 1;
                console.log(`Preceding tab ${precedingTabId} found at index ${precedingTabIndex}. Calculated index: ${calculatedIndex}`);
            } else {
                console.log(`Preceding tab ${precedingTabId} not found in target window.`);
            }
        }

        // If preceding didn't work, try to find position relative to following tab
        if (calculatedIndex === -1 && followingTabId) {
            const followingTabIndex = tabsInTargetWindow.findIndex(tab => tab.id === followingTabId);
            if (followingTabIndex !== -1) {
                calculatedIndex = followingTabIndex; // Insert before the following tab
                console.log(`Following tab ${followingTabId} found at index ${followingTabIndex}. Calculated index: ${calculatedIndex}`);
            } else {
                console.log(`Following tab ${followingTabId} not found in target window.`);
            }
        }

        // Fallback to originalIndex if anchors failed, but cap it at current length
        if (calculatedIndex === -1) {
            calculatedIndex = Math.min(originalIndex, tabsInTargetWindow.length);
            if (calculatedIndex < 0) calculatedIndex = 0;
            console.log(`Anchors not found. Falling back to originalIndex (${originalIndex}). Capped at current length (${tabsInTargetWindow.length}). Final calculated index: ${calculatedIndex}`);
        }
    } else {
        // Original window is gone (unexpected, but handled). Reattach to the end of the current active window for predictability.
        calculatedIndex = -1; // Append to the end
        console.log("Original window does not exist. Reattaching to end of current active window.");
    }

    console.log(`Moving tab ${tabToReattachId} to window ${targetWindowId} at index ${calculatedIndex}.`);
    // Move the tab back
    await chrome.tabs.move(tabToReattachId, { windowId: targetWindowId, index: calculatedIndex });
    await chrome.tabs.update(tabToReattachId, { active: true }); // Make it active

    // Clean up: remove from session storage and local memory
    delete detachedTabsMemory[tabToReattachId];
    await chrome.storage.session.set({ 'detachedTabs': detachedTabsMemory });
    console.log(`Tab ${tabToReattachId} removed from memory.`);

    // Close the now-empty detached window, but only if it was created by the extension for this tab
    // and if it's now truly empty.
    if (detachedWindowId) { // Check if detachedWindowId was actually stored (meaning a new window was created)
        try {
            const tabsInDetachedWindow = await chrome.tabs.query({ windowId: detachedWindowId });
            if (tabsInDetachedWindow.length === 0) {
                await chrome.windows.remove(detachedWindowId);
                console.log(`Detached window ${detachedWindowId} closed as it became empty.`);
            }
        } catch (e) {
            console.warn(`Detached window ${detachedWindowId} might have already been closed or never existed as a separate window. Error:`, e);
        }
    }

    console.log(`Tab ${tabToReattachId} reattached to window ${targetWindowId} at index ${calculatedIndex}.`);

  } catch (error) {
    console.error("Error reattaching tab:", error);
  }
}

// --- Event Listeners for Dynamic Neighbor Tracking ---

/**
 * Generic handler for tab events (moved, created, removed) that might affect neighbor IDs.
 * It iterates through all currently detached tabs and triggers an update if their original window
 * matches the event's window.
 * @param {number} eventWindowId The ID of the window where the tab event occurred.
 */
async function handleTabEventInOriginalWindow(eventWindowId) {
  // Ensure detachedTabsMemory is up-to-date from storage
  const storedData = await chrome.storage.session.get('detachedTabs');
  detachedTabsMemory = storedData.detachedTabs || {};

  // First, check if there are any detached tabs originating from this eventWindowId.
  // If not, we can skip querying tabs in this window entirely.
  const relevantDetachedTabIds = Object.keys(detachedTabsMemory).filter(tabId =>
    detachedTabsMemory[tabId].originalWindowId === eventWindowId
  );

  if (relevantDetachedTabIds.length === 0) {
    return; // No detached tabs originated from this window, so no neighbors to update.
  }

  // Ensure the original window still exists before trying to query its tabs
  try {
    await chrome.windows.get(eventWindowId);
  } catch (e) {
    console.warn(`Original window ${eventWindowId} for detached tabs no longer exists. Skipping neighbor update for its tabs.`);
    return;
  }

  // Query tabs in the event window ONCE.
  const tabsInEventWindow = await chrome.tabs.query({ windowId: eventWindowId });
  tabsInEventWindow.sort((a, b) => a.index - b.index); // Sort once

  // Iterate over only the relevant detached tabs and pass the pre-queried list
  for (const detachedTabIdStr of relevantDetachedTabIds) {
    const detachedTabId = parseInt(detachedTabIdStr);
    console.log(`Tab event in original window ${eventWindowId}. Triggering neighbor update for detached tab ${detachedTabId}.`);
    await updateDetachedTabNeighbors(detachedTabId, eventWindowId, tabsInEventWindow);
  }
}

// Listener for when tabs are moved
chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  console.log(`Tab ${tabId} moved in window ${moveInfo.windowId}.`);
  handleTabEventInOriginalWindow(moveInfo.windowId);
});

// Listener for when tabs are created
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.windowId) {
    console.log(`Tab ${tab.id} created in window ${tab.windowId}.`);
    // A small delay might be beneficial here if onCreated fires before index is stable,
    // but for most cases, it should be fine.
    handleTabEventInOriginalWindow(tab.windowId);
  }
});

// Listener for when tabs are removed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (removeInfo.windowId) {
    console.log(`Tab ${tabId} removed from window ${removeInfo.windowId}.`);
    handleTabEventInOriginalWindow(removeInfo.windowId);
  }
  // Also handle cleanup for the removed tab itself if it was a detached tab
  if (detachedTabsMemory[tabId]) {
    console.log(`Detached tab ${tabId} was closed. Removing from memory.`);
    delete detachedTabsMemory[tabId];
    chrome.storage.session.set({ 'detachedTabs': detachedTabsMemory });
  }
});

// Initialize detachedTabsMemory from session storage when the service worker starts
chrome.runtime.onInstalled.addListener(async () => {
  const storedData = await chrome.storage.session.get('detachedTabs');
  detachedTabsMemory = storedData.detachedTabs || {};
  console.log("Service worker started. Detached tabs from session storage:", detachedTabsMemory);
});

// Clean up detachedWindowId from memory if the window is closed manually
chrome.windows.onRemoved.addListener(async (windowId) => {
    // Iterate through detachedTabsMemory to see if any tab was detached to this window
    for (const tabId in detachedTabsMemory) {
        if (detachedTabsMemory[tabId].detachedWindowId === windowId) {
            // If the window was closed, we no longer need to track it for cleanup
            detachedTabsMemory[tabId].detachedWindowId = null;
            await chrome.storage.session.set({ 'detachedTabs': detachedTabsMemory });
            console.log(`Detached window ${windowId} was closed manually. Cleared detachedWindowId for tab ${tabId}.`);
            // Note: We don't remove the whole tab entry here, as the tab itself might still exist
            // and be reattachable to its original window.
        }
    }
});