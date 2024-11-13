// Copyright 2018 LG Electronics, Inc.
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

var createNevaBrowser = function() {

  var _currentView = null;
  var _defaultUrl = 'http://www.yandex.ru/';


  function createWebView() {
    if (!_currentView) {
      var id = 'neva_view';
      _currentView = document.createElement('webview');
      _currentView.src = _defaultUrl;
      _currentView.id = id;
      return id;
    }
  }

  function insertWebView(id, root) {
    root.appendChild(_currentView);
  }

  function updateLayout(width, height) {
    // iterate over all views
    _currentView.style.width = width + 'px';
    _currentView.style.height = height + 'px';
  }

  function navigateTo(url) {
    _currentView.src = url;
  }

  function back(id) {
    if (!id) {
      _currentView.back();
    }
  }

  function forward(id) {
    if (!id) {
      _currentView.forward();
    }
  }

  function setEventListeners(listeners) {
    for (var evt in listeners) {
      _currentView.addEventListener(evt, listeners[evt]);
    }
  }

  return {
    createWebView : createWebView,
    insertWebView : insertWebView,
    updateLayout : updateLayout,
    navigateTo : navigateTo,
    setEventListeners : setEventListeners,
    back : back,
    forward : forward
  };
};