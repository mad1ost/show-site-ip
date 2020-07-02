'use strict';

let tabs = {};

function changeIcon(tabId, details) {
  if (!(tabId in tabs)) {
    tabs[tabId] = {
      onResponseStarted: false,
      onCommitted: false
    };
  }
  tabs[tabId] = Object.assign(tabs[tabId], details);
  const tab = tabs[tabId];
  // wait until both callbacks have been completed
  if (tab.onResponseStarted && tab.onCommitted) {
    if (tab.fromCache) {
      browser.pageAction.setIcon({
        tabId: tabId,
        path: 'icons/no-ip.svg',
      });
      browser.pageAction.setTitle({
        tabId: tabId,
        title: 'Page was loaded from cache',
      });
    } else {
      browser.pageAction.setTitle({
        tabId: tabId,
        title: tab.ip,
      });
    }
    tab.onResponseStarted = false;
    tab.onCommitted = false;
  }
}

browser.webRequest.onResponseStarted.addListener(
  (details) => {
    if (details.tabId === -1) return;
    changeIcon(details.tabId, {
      onResponseStarted: true,
      fromCache: details.fromCache,
      ip: details.ip
    });
  },
  {
    urls: ['http://*/*', 'https://*/*'],
    types: ['main_frame']
  }
);

browser.webNavigation.onCommitted.addListener(
  (details) => {
    if (details.frameId !== 0) return;
    changeIcon(details.tabId, {
      onCommitted: true
    });
  },
  {
    url: [
      {
        schemes: ['http', 'https']
      }
    ]
  }
);

browser.tabs.onRemoved.addListener((tabId) => {
  delete tabs[tabId];
});

browser.pageAction.onClicked.addListener((tab) => {
  browser.pageAction.getTitle({
    tabId: tab.id
  }).then(title => {
    const body = document.body;
    const textarea = document.createElement('textarea');
    textarea.textContent = title;
    body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    body.removeChild(textarea);
  });
});
