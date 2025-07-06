class TabManager {
  constructor() {
    this.tabStateMap = new Map(); // tabId => { windowId, positionValue, manuallyReattached? }
    this.livePositionMap = new Map(); // windowId => Map(tabId => positionValue)
    this.initialized = false;
  }

  // --- Rational Helpers ---
  initialRational(index) {
    return { num: (index + 1) * 5000, den: 1 };
  }

  rationalToFloat(r) {
    return r.num / r.den;
  }

  rationalMediant(r1, r2) {
    return { num: r1.num + r2.num, den: r1.den + r2.den };
  }

  computePositionBetween(leftTab, rightTab) {
    const leftPos = leftTab ? this.tabStateMap.get(leftTab.id)?.positionValue : null;
    const rightPos = rightTab ? this.tabStateMap.get(rightTab.id)?.positionValue : null;

    if (leftPos && rightPos) return this.rationalMediant(leftPos, rightPos);
    if (leftPos) return this.rationalMediant(leftPos, { num: 1, den: 1 });
    if (rightPos) return this.rationalMediant({ num: 1, den: 1 }, rightPos);
    return { num: 1, den: 1 };
  }

  updateTabState(tabId, windowId, positionValue, opts = {}) {
    const { manuallyReattached = false } = opts;
    this.tabStateMap.set(tabId, { windowId, positionValue, manuallyReattached });

    const posMap = this.livePositionMap.get(windowId) || new Map();
    posMap.set(tabId, positionValue);
    this.livePositionMap.set(windowId, posMap);
  }

  moveTabAndFocus(tabId, windowId, index = -1, callback) {
    chrome.tabs.move(tabId, { windowId, index }, () => {
      chrome.windows.update(windowId, { focused: true }, () => {
        chrome.tabs.update(tabId, { active: true }, callback);
      });
    });
  }

  // --- Session Sync ---
  serialize() {
    return {
      initialized: this.initialized,
      tabStateMap: Object.fromEntries(this.tabStateMap),
      livePositionMap: Object.fromEntries([...this.livePositionMap.entries()].map(
        ([winId, map]) => [winId, Object.fromEntries(map)]
      )),
    };
  }

  deserialize(data) {
    this.initialized = data.initialized || false;

    this.tabStateMap = new Map(Object.entries(data.tabStateMap || {}).map(
      ([k, v]) => [Number(k), v]
    ));

    this.livePositionMap = new Map(Object.entries(data.livePositionMap || {}).map(
      ([winId, tabObj]) => [Number(winId), new Map(Object.entries(tabObj).map(
        ([tabId, val]) => [Number(tabId), val]
      ))]
    ));
  }

  sync() {
    chrome.storage.session.set(this.serialize());
  }

  restore(callback) {
    chrome.storage.session.get(null, (data) => {
      this.deserialize(data);
      if (callback) callback();
    });
  }

  // --- Tab Logic ---
  initializeTabPositions() {
    chrome.windows.getAll({ populate: true }, (windows) => {
      for (const win of windows) {
        if (win.incognito) continue;
        const positionMap = new Map();
        win.tabs.forEach((tab, index) => {
          if (tab.incognito) return;
          const pos = this.initialRational(index);
          positionMap.set(tab.id, pos);
          this.tabStateMap.set(tab.id, { windowId: win.id, positionValue: pos });
        });
        this.livePositionMap.set(win.id, positionMap);
      }
      this.sync();
    });
  }

  assignPositionValue(tabId, windowId) {
    chrome.windows.get(windowId, { populate: true }, (win) => {
      if (!win?.tabs) return;

      const positionMap = this.livePositionMap.get(windowId);
      if (!positionMap) return;

      const tabs = win.tabs.filter(t => !t.incognito).sort((a, b) => a.index - b.index);
      const index = tabs.findIndex(t => t.id === tabId);
      if (index === -1) return;

      const pos = this.computePositionBetween(tabs[index - 1], tabs[index + 1]);
      positionMap.set(tabId, pos);
      this.updateTabState(tabId, windowId, pos);
    });
  }

  detachTab(tab) {
    const state = this.tabStateMap.get(tab.id);
    if (!state || tab.windowId !== state.windowId || tab.incognito) return;

    chrome.windows.get(tab.windowId, { populate: true }, (win) => {
      const tabs = win.tabs.filter(t => !t.incognito);
      let newPos;

      if (tab.index === tabs.length - 1) {
        // Assign a position value greater than all existing ones
        const values = tabs
          .filter(t => t.id !== tab.id)
          .map(t => this.tabStateMap.get(t.id)?.positionValue)
          .filter(Boolean);

        const maxVal = values.reduce((max, val) =>
          this.rationalToFloat(val) > this.rationalToFloat(max) ? val : max,
          { num: 1, den: 1 }
        );

        newPos = { num: maxVal.num + 5000, den: maxVal.den };
      } else {
        newPos = this.computePositionBetween(
          tabs[tab.index - 1],
          tabs[tab.index + 1]
        );
      }

      this.updateTabState(tab.id, tab.windowId, newPos);
      const posMap = this.livePositionMap.get(tab.windowId);
      if (posMap) posMap.delete(tab.id);

      chrome.windows.getAll({}, (windows) => {
        const otherWindow = windows.find(w => w.id !== tab.windowId && !w.incognito);
        const done = () => this.sync();

        if (otherWindow) this.moveTabAndFocus(tab.id, otherWindow.id, -1, done);
        else chrome.windows.create({ tabId: tab.id, focused: true }, done);
      });
    });
  }

  reattachTab(tabId) {
    const state = this.tabStateMap.get(tabId);
    if (!state) return;

    chrome.tabs.get(tabId, (tab) => {
      if (!tab || tab.incognito) return;

      const { windowId, positionValue, manuallyReattached } = state;
      if (tab.windowId === windowId && !manuallyReattached) return;

      chrome.windows.get(windowId, { populate: true }, (win) => {
        if (!win || !win.tabs) return;

        const tabEntries = win.tabs
          .filter(t => !t.incognito && t.id !== tabId)
          .map((t) => {
            const pos = this.tabStateMap.get(t.id)?.positionValue || this.initialRational(t.index);
            return { tab: t, pos };
          });

        tabEntries.sort((a, b) => this.rationalToFloat(a.pos) - this.rationalToFloat(b.pos));
        const targetFloat = this.rationalToFloat(positionValue);
        let insertIndex = win.tabs.length;

        for (const entry of tabEntries) {
          if (targetFloat < this.rationalToFloat(entry.pos)) {
            insertIndex = entry.tab.index;
            break;
          }
        }

        this.moveTabAndFocus(tabId, windowId, insertIndex, () => {
          this.updateTabState(tabId, windowId, positionValue);
          this.sync();
        });
      });
    });
  }

  handleTabAttached(tabId, attachInfo) {
    const state = this.tabStateMap.get(tabId);
    if (!state || state.windowId === attachInfo.newWindowId) return;
    this.updateTabState(tabId, state.windowId, state.positionValue, { manuallyReattached: true });
    this.sync();
  }

  handleTabRemoved(tabId) {
    this.tabStateMap.delete(tabId);
    for (const map of this.livePositionMap.values()) {
      map.delete(tabId);
    }
    this.sync();
  }

  handleWindowRemoved(windowId) {
    this.livePositionMap.delete(windowId);
    for (const [tabId, state] of this.tabStateMap.entries()) {
      if (state.windowId === windowId) {
        this.tabStateMap.delete(tabId);
      }
    }
    this.sync();
  }
}

// --- Extension Setup ---
const tabManager = new TabManager();

tabManager.restore(() => {
  tabManager.restore(() => {
    if (!tabManager.initialized) {
      tabManager.initialized = true;
      tabManager.initializeTabPositions();
    }

    chrome.commands.onCommand.addListener((command) => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab) return;
        if (command === "detach-tab") tabManager.detachTab(tab);
        if (command === "reattach-tab") tabManager.reattachTab(tab.id);
      });
    });
  });
});

chrome.tabs.onCreated.addListener((tab) => {
  if (!tabManager.initialized || tab.incognito) return;
  tabManager.assignPositionValue(tab.id, tab.windowId);
});

chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  tabManager.handleTabAttached(tabId, attachInfo);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabManager.handleTabRemoved(tabId);
});

chrome.windows.onRemoved.addListener((windowId) => {
  tabManager.handleWindowRemoved(windowId);
});
