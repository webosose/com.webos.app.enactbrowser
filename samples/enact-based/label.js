// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

let webviewHostInjectionComplete = false;
(function () {
	'use strict';
	// Prevent multiple injection
	if (!webviewHostInjectionComplete) {

		const codeInjection = function () {
			// simulate 'installablemanager' API
			if (typeof (window.navigator.installablemanager) !== 'object') {
				window.navigator.installablemanager = {
					getInfo: (callback) => {
						console.log(`getInfo`);
						callback(true, false);
					},
					installApp: (callback) => {
						console.log(`installApp`);
						callback(true);
					}
				};
			}

			document.addEventListener('requestInstallableManager', ({ detail }) => {
				if (detail.method === 'getInfo') {
					window.navigator.installablemanager.getInfo((installable, installed) => {
						document.dispatchEvent(new CustomEvent('replayInstallableManager', {
							detail: { installable, installed }
						}));
					});

				} else if (detail.method === 'installApp') {
					window.navigator.installablemanager.installApp((pSuccess) => {
						document.dispatchEvent(new CustomEvent('replayInstallableManager', {
							detail: { pSuccess }
						}));
					});
				}
			});
		};

		// inject script for installablemanager
		var script = document.createElement('script');
		script.textContent = '(' + codeInjection + ')()';
		(document.head || document.documentElement).appendChild(script);
		script.remove();

		let actions = {};
		// getTitle variables
		let listenerId = null;
		let observer = null;
		let postTitle = function (embedder) {
			let data = {
				'id': listenerId,
				'title': document.title || '[no title]',
				'action': 'getTitle'
			};
			embedder.postMessage(data, '*');
		};
		actions.getTitle = function (ev) {
			let data = ev.data;
			// bind embedder
			let embedder = ev.source;
			// bind webview id
			listenerId = data.id;

			// Notify the embedder of every title change
			let titleElement = document.querySelector('title');
			if (titleElement) {
				titleElement.addEventListener('change', postTitle);
				observer = new window.WebKitMutationObserver(function (mutations) {
					mutations.forEach(function () {
						postTitle(embedder);
					});
				});
				observer.observe(titleElement, {
					subtree: true,
					characterData: true,
					childList: true
				});
			} else {
				console.warn('Warning: No <title> element to bind to'); // eslint-disable-line no-console
			}

			postTitle(embedder);
		};

		actions.getInfo = function (ev) {
			try {
				document.addEventListener('replayInstallableManager', ({ detail }) => {
					ev.source.postMessage({
						id: ev.data.id,
						action: ev.data.action,
						installable: detail.installable,
						installed: detail.installed
					}, '*');
				});

				document.dispatchEvent(new CustomEvent('requestInstallableManager', {
					detail: { method: 'getInfo' }
				}));
			} catch (e) {
				console.log(e);
			}
		};

		actions.installApp = function (ev) {
			try {
				document.addEventListener('replayInstallableManager', ({ detail }) => {
					ev.source.postMessage({
						id: ev.data.id,
						action: ev.data.action,
						pSuccess: detail.pSuccess
					}, '*');
				});

				document.dispatchEvent(new CustomEvent('requestInstallableManager', {
					detail: { method: 'installApp' }
				}));
			} catch (e) {
				console.log(e);
			}
		};

		actions.getFavicons = function (ev) {
			let links = document.querySelectorAll('link[rel*="icon"]');
			let favicons = [];
			links.forEach(function (link) {
				favicons.push({
					rel: link.getAttribute('rel'),
					type: link.getAttribute('type'),
					sizes: link.getAttribute('sizes'),
					// unlike getAttribute('href') returns absolute url
					href: link.href
				});
			});

			let data = {
				id: ev.data.id,
				rootUrl: window.location.origin + '/',
				favicons: favicons,
				action: ev.data.action
			};
			ev.source.postMessage(data, 'chrome-extension://aghbafhkpnlmgikmhdeeneldnbljdkgo');
		};

		// Wait for message that gives us a reference to the embedder
		window.addEventListener('message', function (ev) {
			if (ev.origin === 'chrome-extension://aghbafhkpnlmgikmhdeeneldnbljdkgo' && ev.data && ev.data.isNeva) {
				actions[ev.data.action](ev);
			}
		});

		// handles 'Esc' button to exit from fullscreen entered from guest page
		document.addEventListener('keydown', function (ev) {
			if (ev.keyCode === 27 && document.webkitIsFullScreen) {
				document.webkitExitFullscreen();
			}
		});
	}
})();
