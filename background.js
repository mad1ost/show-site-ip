'use strict';

browser.webRequest.onResponseStarted.addListener(
  (requestDetails) => {
    if (requestDetails.tabId === -1) return;
    
    setTimeout(() => {
      if (requestDetails.fromCache) {
        browser.pageAction.setIcon({
          tabId: requestDetails.tabId,
          path: 'icons/no-ip.svg',
        });
        browser.pageAction.setTitle({
          tabId: requestDetails.tabId,
          title: 'Page was loaded from cache',
        });
      } else {
        browser.pageAction.setTitle({
          tabId: requestDetails.tabId,
          title: requestDetails.ip,
        });
      }
    }, 100);
  },
  {
    urls: ['<all_urls>'],
    types: ['main_frame']
  }
);

browser.pageAction.onClicked.addListener((tab) => {
  browser.pageAction.getTitle({
    tabId: tab.id
  }).then(title => {
    const el = document.createElement('textarea');
    el.textContent = title;
    const body = document.body;
    body.appendChild(el);
    el.select();
    document.execCommand('copy');
    body.removeChild(el);
  });
});
