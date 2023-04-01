'use strict';

const tabs = {};

function updateIcon(details, event) {
	const tabId = details.tabId;
	if (!(tabId in tabs)) {
		tabs[tabId] = { onResponseStarted: null, onCommitted: null };
	}
	const tab = tabs[tabId];
	tab[event] = details;
	if (tab.onCommitted && tab.onResponseStarted === null) {
		browser.pageAction.setIcon({ tabId: tabId, path: 'icons/no-ip.svg' });
	} else if (tab.onCommitted && tab.onResponseStarted) {
		if (tab.onResponseStarted.timeStamp >= tab.onCommitted.timeStamp) return;
		if (tab.onResponseStarted.proxyInfo !== null) {
			browser.pageAction.setIcon({ tabId: tabId, path: 'icons/no-ip.svg' });
			browser.pageAction.setTitle({ tabId: tabId, title: browser.i18n.getMessage('through_proxy') });
		} else if (tab.onResponseStarted.ip !== null && tab.onResponseStarted.fromCache === false) {
			browser.pageAction.setIcon({ tabId: tabId, path: 'icons/ip.svg' });
			browser.pageAction.setTitle({ tabId: tabId, title: tab.onResponseStarted.ip });
		//} else if (tab.onResponseStarted.ip !== null && tab.onResponseStarted.fromCache == true || // 304 Not Modified
		//	tab.onResponseStarted.ip === null && tab.onResponseStarted.fromCache == true || // bfcache
		//	tab.onResponseStarted.ip === null && tab.onResponseStarted.fromCache == false) { // bug
		} else {
			browser.pageAction.setIcon({ tabId: tabId, path: 'icons/no-ip.svg' });
			browser.pageAction.setTitle({ tabId: tabId, title: browser.i18n.getMessage('from_cache') });
		}
		delete tabs[tabId];
	}
}

browser.webRequest.onResponseStarted.addListener(
	(details) => {
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
	browser.pageAction.getTitle({ tabId: tab.id }).then((title) => {
		navigator.clipboard.writeText(title)
	});
});
