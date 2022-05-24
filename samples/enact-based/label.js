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
