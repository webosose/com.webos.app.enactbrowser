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
  }
};