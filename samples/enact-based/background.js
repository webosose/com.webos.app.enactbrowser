// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  runApp();
});

/**
 * Listens for the app restarting then re-creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 */
chrome.app.runtime.onRestarted.addListener(function() {
  runApp();
});

/**
 * Creates the window for the application and set up event listener to handle the message
 *
 * @see http://developer.chrome.com/apps/app.window.html
 * @see https://developer.chrome.com/extensions/messaging
 */
function runApp() {
  chrome.app.window.create('index.html', {
    id: "browserWinID",
    innerBounds: {
      'width': 1024,
      'height': 768
    }
  });

  chrome.runtime.onMessage.addListener(function(request) {
    if (request.event === 'localechange') {
      chrome.runtime.reload();
    }
  });
}
