// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

var webviewHostInjectionComplete = false;
(function() {
  // Prevent multiple injection
  if (!webviewHostInjectionComplete) {
    var actions = {};
    // getTitle variables
    var listenerId = null;
    var observer = null;
    var postTitle = function(embedder) {
      var data = {
        'id': listenerId,
        'title': document.title || '[no title]',
        'action': 'getTitle'
      };
      embedder.postMessage(data, '*');
    };
    actions["getTitle"] = function(ev) {
      var data = ev.data;
      // bind embedder
      var embedder = ev.source;
      // bind webview id
      listenerId = data.id;

      // Notify the embedder of every title change
      var titleElement = document.querySelector('title');
      if (titleElement) {
        titleElement.addEventListener('change', postTitle);
        observer = new window.WebKitMutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                postTitle(embedder);
            });
        });
        observer.observe(titleElement, {
          subtree: true,
          characterData: true,
          childList: true
        });
      } else {
        console.warn('Warning: No <title> element to bind to');
      }

      postTitle(embedder);
    };

    // Wait for message that gives us a reference to the embedder
    window.addEventListener('message', function(ev) {
      if (ev.data && ev.data.isNeva) {
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
}());
