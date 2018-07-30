// Copyright (c) 2018 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

var webviewTitleInjectionComplete = false;
(function() {
  // Prevent multiple injection
  if (!webviewTitleInjectionComplete) {
    var embedder = null;
    var tabId = null;
    var listenersAreBound = false;
    var title = null;
    var postTitle = (function() {
      return function(e) {
        title = document.title;
        var data = {
          'id': tabId,
          'title': title || '[no title]'
        };
        embedder.postMessage(JSON.stringify(data), '*');
      };
    }());
    var bindEmbedder = function(e) {
      embedder = e.source;
    };
    var bindTabName = function(e) {
      if (e.data) {
        var data = JSON.parse(e.data);
        if (data.id) {
          tabId = data.id;
        } else {
          console.warn('Warning: Message from embedder contains no tab id');
        }
      } else {
          console.warn('Warning: Message from embedder contains no data');
      }
    };

    // Wait for message that gives us a reference to the embedder
    window.addEventListener('message', function(e) {
      if (!listenersAreBound) {
        // Bind data
        bindEmbedder(e);
        bindTabName(e);

        // Notify the embedder of every title change
        var titleElement = document.querySelector('title');
        if (titleElement) {
          titleElement.addEventListener('change', postTitle);
        } else {
          console.warn('Warning: No <title> element to bind to');
          postTitle();
        }

        // Ensure initial title notification
        if (title === null) {
          postTitle();
        }

        listenersAreBound = true;
      }
    });
  }
}());
