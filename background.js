'use strict';

browser.webRequest.onResponseStarted.addListener(
  (requestDetails) => {
    if (requestDetails.documentUrl !== undefined ||
      requestDetails.tabId < 0) return;
    
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
  {urls: ["<all_urls>"]}
);
