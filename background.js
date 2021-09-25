'use strict';

const tabs = {};
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
const blockedDomains = [
  'accounts-static.cdn.mozilla.net',
  'accounts.firefox.com',
  'addons.cdn.mozilla.net',
  'addons.mozilla.org',
  'api.accounts.firefox.com',
  'content.cdn.mozilla.net',
  'content.cdn.mozilla.net',
  'discovery.addons.mozilla.org',
  'input.mozilla.org',
  'install.mozilla.org',
  'oauth.accounts.firefox.com',
  'profile.accounts.firefox.com',
  'support.mozilla.org',
  'sync.services.mozilla.com',
  'testpilot.firefox.com'
];

function updateIcon(tabId, details, event) {
  if (!(tabId in tabs)) {
    tabs[tabId] = {};
  }
  const tab = tabs[tabId];
  tab[event] = details;
  if (!('onCommitted' in tab)) return;
  if ('onResponseStarted' in tab) {
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
      if (event === 'onResponseStarted'
          && tab.onCommitted.transitionQualifiers.indexOf('forward_back') !== -1) {
        browser.pageAction.setIcon({
          tabId: tabId,
          path: 'icons/ip.svg'
        });
      }
    }
    delete tabs[tabId];
  } else if (tab.onCommitted.transitionQualifiers.indexOf('forward_back') !== -1) {
    browser.pageAction.setIcon({
      tabId: tabId,
      path: 'icons/no-ip.svg'
    });
    browser.pageAction.setTitle({
      tabId: tabId,
      title: browser.i18n.getMessage('from_cache')
    });
  }
}

browser.webRequest.onResponseStarted.addListener(
  (details) => {
    if (details.tabId === -1) return;
    updateIcon(details.tabId, details, 'onResponseStarted');
  },
  {
    urls: ['http://*/*', 'https://*/*'],
    types: ['main_frame']
  }
);

browser.webNavigation.onCommitted.addListener(
  (details) => {
    if (details.frameId !== 0) return;
    const url = new URL(details.url);
    if (blockedDomains.indexOf(url.hostname) !== -1) return;
    updateIcon(details.tabId, details, 'onCommitted');
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
