let listeningTabs = [];

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) =>
    toggleTab(tab.id)
  );
});

function toggleTab(tabId) {
  const index = listeningTabs.indexOf(tabId);
  if (index >= 0) {
    listeningTabs.splice(index, 1);
    chrome.browserAction.setBadgeText({ text: "", tabId: tabId });
    chrome.tabs.sendMessage(tabId, {
      show: false,
    });
  } else {
    listeningTabs.push(tabId);
    chrome.tabs.sendMessage(tabId, {
      show: true,
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: "green",
      tabId: tabId,
    });
    chrome.browserAction.setBadgeText({ text: "ON", tabId: tabId });
  }
}
