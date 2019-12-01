'use strict';

browser.webRequest.onHeadersReceived.addListener(
  (requestDetails) => {
    if (requestDetails.documentUrl !== undefined ||
      requestDetails.tabId < 0) return;
    
    setTimeout(() => {
      const title = (() => {
        if (requestDetails.fromCache) return 'Page was loaded from cache';
        return requestDetails.ip;
      })();
      
      browser.pageAction.setTitle({
        tabId: requestDetails.tabId,
        title: title
      });
    }, 100);
  },
  {urls: ["<all_urls>"]}
);
