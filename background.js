'use strict';

const tabs = {};

function updateIcon(details, event) {
  const tabId = details.tabId;
  if (!(tabId in tabs)) {
    tabs[tabId] = {
      onResponseStarted: null,
      onCommitted: null
    }
  }
  const tab = tabs[tabId];
  tab[event] = details;
  if (tab.onCommitted && tab.onResponseStarted === null) {
    if (details.transitionQualifiers.indexOf('forward_back') !== -1) { // bfcache
      browser.pageAction.setIcon({
        tabId: details.tabId,
        path: 'icons/no-ip.svg'
      });
      browser.pageAction.setTitle({
        tabId: details.tabId,
        title: browser.i18n.getMessage('from_cache')
      });
    }
  } else if (tab.onCommitted && tab.onResponseStarted) {
    if (tab.onResponseStarted.timeStamp >= tab.onCommitted.timeStamp) return;
    if (tab.onResponseStarted.fromCache) {
      browser.pageAction.setIcon({
        tabId: tabId,
        path: 'icons/no-ip.svg'
      });
      browser.pageAction.setTitle({
        tabId: tabId,
        title: browser.i18n.getMessage('from_cache')
      });
    } else if (tab.onResponseStarted.proxyInfo !== null) {
      browser.pageAction.setIcon({
        tabId: tabId,
        path: 'icons/no-ip.svg'
      });
      browser.pageAction.setTitle({
        tabId: tabId,
        title: browser.i18n.getMessage('through_proxy')
      });
    } else {
      browser.pageAction.setTitle({
        tabId: tabId,
        title: tab.onResponseStarted.ip
      });
      if (tab.onCommitted.transitionQualifiers.indexOf('forward_back') !== -1) {
        browser.pageAction.setIcon({
          tabId: tabId,
          path: 'icons/ip.svg'
        });
      }
    }
    delete tabs[tabId];
  }
}

browser.webRequest.onResponseStarted.addListener(
  (details) => {
    if (details.frameId !== 0) return;
    updateIcon(details, 'onResponseStarted');
  },
  {
    urls: ['http://*/*', 'https://*/*'],
    types: ['main_frame']
  }
);

browser.webNavigation.onCommitted.addListener(
  (details) => {
    if (details.frameId !== 0) return;
    updateIcon(details, 'onCommitted');
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
  let gettingTitle = browser.pageAction.getTitle({
    tabId: tab.id
  });
  gettingTitle.then((title) => navigator.clipboard.writeText(title));
});
