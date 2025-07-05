// background.js

const tabStateMap = new Map(); // tabId => { windowId, positionValue: { num, den } }
const livePositionMap = new Map(); // windowId => Map(tabId => { num, den })

function initialRational(index) {
  return { num: (index + 1), den: 1 };
}

function rationalToFloat(r) {
  return r.num / r.den;
}

function rationalMediant(r1, r2) {
  return { num: r1.num + r2.num, den: r1.den + r2.den };
}

function initializeTabPositions() {
  chrome.windows.getAll({ populate: true }, (windows) => {
    for (const win of windows) {
      const positionMap = new Map();
      win.tabs.forEach((tab, index) => {
        const pos = initialRational(index);
        positionMap.set(tab.id, pos);
        tabStateMap.set(tab.id, { windowId: win.id, positionValue: pos });
      });
      livePositionMap.set(win.id, positionMap);
    }
  });
}

chrome.runtime.onStartup.addListener(initializeTabPositions);
chrome.runtime.onInstalled.addListener(initializeTabPositions);

function detachTab(tab) {
  const state = tabStateMap.get(tab.id);
  if (!state) return;

  if (tab.windowId !== state.windowId) return; // already detached, do nothing

  chrome.windows.get(tab.windowId, { populate: true }, (win) => {
    const tabs = win.tabs;
    const index = tab.index;

    const left = tabs[index - 1];
    const right = tabs[index + 1];

    const leftPos = left ? tabStateMap.get(left.id)?.positionValue : null;
    const rightPos = right ? tabStateMap.get(right.id)?.positionValue : null;

    let newPos;
    if (leftPos && rightPos) {
      newPos = rationalMediant(leftPos, rightPos);
    } else if (leftPos) {
      newPos = rationalMediant(leftPos, { num: 1, den: 1 });
    } else if (rightPos) {
      newPos = rationalMediant({ num: 1, den: 1 }, rightPos);
    } else {
      newPos = { num: 1, den: 1 };
    }

    tabStateMap.set(tab.id, { windowId: tab.windowId, positionValue: newPos });

    const positionMap = livePositionMap.get(tab.windowId);
    if (positionMap) positionMap.delete(tab.id);

    chrome.windows.getAll({}, (windows) => {
      const otherWindow = windows.find(w => w.id !== tab.windowId && !w.incognito);

      if (!otherWindow) {
        chrome.windows.create({ tabId: tab.id, focused: true });
      } else {
        chrome.tabs.move(tab.id, { windowId: otherWindow.id, index: -1 }, () => {
          chrome.windows.update(otherWindow.id, { focused: true }, () => {
            chrome.tabs.update(tab.id, { active: true });
          });
        });
      }
    });
  });
}

function reattachTab(tabId) {
  const state = tabStateMap.get(tabId);
  if (!state) return;

  chrome.tabs.get(tabId, (tab) => {
    if (!tab || tab.windowId === state.windowId) return; // already in correct window, do nothing

    const { windowId, positionValue } = state;

    chrome.windows.get(windowId, { populate: true }, (win) => {
      const otherTabs = win.tabs.filter(t => t.id !== tabId);
      const tabEntries = otherTabs
        .filter(t => tabStateMap.has(t.id))
        .map(t => ({ tab: t, pos: tabStateMap.get(t.id).positionValue }));

      tabEntries.sort((a, b) => rationalToFloat(a.pos) - rationalToFloat(b.pos));

      let insertIndex = win.tabs.length;
      const targetFloat = rationalToFloat(positionValue);

      for (let i = 0; i < tabEntries.length; i++) {
        const entryFloat = rationalToFloat(tabEntries[i].pos);
        if (entryFloat > targetFloat) {
          const visualTab = win.tabs.find(t => t.id === tabEntries[i].tab.id);
          if (visualTab) {
            insertIndex = visualTab.index;
            break;
          }
        }
      }

      chrome.tabs.move(tabId, { windowId, index: insertIndex }, () => {
        const posMap = livePositionMap.get(windowId) || new Map();
        posMap.set(tabId, positionValue);
        livePositionMap.set(windowId, posMap);

        tabStateMap.set(tabId, { windowId, positionValue });

        chrome.windows.update(windowId, { focused: true }, () => {
          chrome.tabs.update(tabId, { active: true });
        });
      });
    });
  });
}

function updateWindowPositionValues(windowId, callback) {
  chrome.windows.get(windowId, { populate: true }, (win) => {
    const newMap = new Map();
    win.tabs.forEach((tab, index) => {
      const pos = initialRational(index);
      newMap.set(tab.id, pos);
      tabStateMap.set(tab.id, { windowId, positionValue: pos });
    });
    livePositionMap.set(windowId, newMap);
    if (callback) callback();
  });
}

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab) return;
    if (command === "detach-tab") detachTab(tab);
    if (command === "reattach-tab") reattachTab(tab.id);
  });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabStateMap.delete(tabId);
  for (const map of livePositionMap.values()) {
    map.delete(tabId);
  }
});

chrome.windows.onRemoved.addListener((windowId) => {
  livePositionMap.delete(windowId);
  for (const [tabId, state] of tabStateMap.entries()) {
    if (state.windowId === windowId) {
      tabStateMap.delete(tabId);
    }
  }
});