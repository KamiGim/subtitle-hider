// Persist active tabs in storage so service worker restarts don't lose state
async function getActiveTabs() {
  try {
    const data = await chrome.storage.local.get('activeTabs');
    return data.activeTabs || [];
  } catch (e) {
    console.error('subtitle-hider: failed to get active tabs', e);
    return [];
  }
}

async function setActiveTabs(tabs) {
  try {
    await chrome.storage.local.set({ activeTabs: tabs });
  } catch (e) {
    console.error('subtitle-hider: failed to save active tabs', e);
  }
}

async function toggleTab(tabId) {
  const activeTabs = await getActiveTabs();
  const index = activeTabs.indexOf(tabId);

  if (index >= 0) {
    activeTabs.splice(index, 1);
    await setActiveTabs(activeTabs);
    try {
      await chrome.action.setBadgeText({ text: '', tabId });
    } catch (e) { /* tab may be gone */ }
    try {
      chrome.tabs.sendMessage(tabId, { show: false });
    } catch (e) { /* content script may not be loaded */ }
  } else {
    activeTabs.push(tabId);
    await setActiveTabs(activeTabs);
    try {
      chrome.tabs.sendMessage(tabId, { show: true });
    } catch (e) { /* content script may not be loaded */ }
    try {
      await chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId });
      await chrome.action.setBadgeText({ text: 'ON', tabId });
    } catch (e) { /* tab may be gone */ }
  }
}

// Toolbar icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.id != null) toggleTab(tab.id);
});

// Keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-subtitle-hider') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id != null) toggleTab(tabs[0].id);
    });
  }
});

// Clean up on tab close
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const activeTabs = await getActiveTabs();
  const index = activeTabs.indexOf(tabId);
  if (index >= 0) {
    activeTabs.splice(index, 1);
    await setActiveTabs(activeTabs);
  }
});

// Restore badge on service worker restart
chrome.tabs.query({}, async (tabs) => {
  const activeTabs = await getActiveTabs();
  for (const tabId of activeTabs) {
    try {
      await chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId });
      await chrome.action.setBadgeText({ text: 'ON', tabId });
    } catch (e) { /* tab no longer exists */ }
  }
});
