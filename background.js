'use strict';

const tabs = {};

function changeIcon(tabId, details, event) {
  if (!(tabId in tabs)) {
    tabs[tabId] = {};
  }
  const tab = tabs[tabId];
  tab[event] = details;
  // wait until both callbacks have been completed
  if ('onResponseStarted' in tab && 'onCommitted' in tab) {
    if (tab.onResponseStarted.fromCache) {
      browser.pageAction.setIcon({
        tabId: tabId,
        path: 'icons/no-ip.svg'
      });
      browser.pageAction.setTitle({
        tabId: tabId,
        title: browser.i18n.getMessage('from_cache')
      });
    } else {
      browser.pageAction.setTitle({
        tabId: tabId,
        title: tab.onResponseStarted.ip
      });
    }
    delete tab.onResponseStarted;
    delete tab.onCommitted;
  }
}

browser.webRequest.onResponseStarted.addListener(
  (details) => {
    if (details.tabId === -1) return;
    changeIcon(details.tabId, details, 'onResponseStarted');
  },
  {
    urls: ['http://*/*', 'https://*/*'],
    types: ['main_frame']
  }
);

browser.webNavigation.onCommitted.addListener(
  (details) => {
    if (details.frameId !== 0) return;
    changeIcon(details.tabId, details, 'onCommitted');
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
