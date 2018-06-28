// When the user clicks on the button,
// toggle between hiding and showing the dropdown content
function toggleDropdown(id) {
    var elem = document.getElementById(id);
    elem.classList.toggle('dropdown__content--show');
    document.querySelector('#global_overlay').style.display = 'block';
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropdown') && !event.target.matches('.dropdown-img')) {

    var dropdowns = document.getElementsByClassName('dropdown__content');
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('dropdown__content--show')) {
        openDropdown.classList.remove('dropdown__content--show');
      }
    }
    document.querySelector('#global_overlay').style.display = 'none';
  }
}

function switchOmniboxSmartButton(state) {
  if (state == 'loading') {
    document.querySelector('#omnibox__go-button').style.display = 'none';
    document.querySelector('#omnibox__reload-button').style.display = 'none';
    document.querySelector('#omnibox__stop-button').style.display = 'block';
  }
  else if (state == 'loaded') {
    document.querySelector('#omnibox__go-button').style.display = 'none';
    document.querySelector('#omnibox__stop-button').style.display = 'none';
    document.querySelector('#omnibox__reload-button').style.display = 'block';
  }
  else if (state == 'input') {
    document.querySelector('#omnibox__go-button').style.display = 'block';
    document.querySelector('#omnibox__stop-button').style.display = 'none';
    document.querySelector('#omnibox__reload-button').style.display = 'none';
  }
}

window.onresize = doLayout;
var isLoading = false;
var isInput = false;
var browser = null;

window.onload = function() {
  document.querySelector('#tools-dropdown').onclick = function() {
    toggleDropdown('tools-dropdown__content');
  }

  browser = createNevaBrowser();
  browser.createWebView();
  browser.insertWebView("neva_view", document.body)
  doLayout();

  var version = navigator.appVersion.substr(navigator.appVersion.lastIndexOf('Chrome/') + 7);
  var match = /([0-9]*)\.([0-9]*)\.([0-9]*)\.([0-9]*)/.exec(version);
  var majorVersion = parseInt(match[1]);
  var buildVersion = parseInt(match[3]);

  document.querySelector('#back').onclick = function() {
    browser.back();
  };

  document.querySelector('#forward').onclick = function() {
    browser.forward();
  };

  document.querySelector('#omnibox-form').onsubmit = function(e) {
    e.preventDefault();
    console.log('#omnibox-form.onsubmit');
    isInput = false;
    browser.navigateTo(document.querySelector('#omnibox__url-input').value);
  };
  document.querySelector('#omnibox__add-to-favourites').onclick = function(e) {
    e.preventDefault();
    console.log('#omnibox__add-to-favourites.onclick');
  }
  document.querySelector('#omnibox__stop-button').onclick = function(e) {
    e.preventDefault();
    console.log('#omnibox__stop-button.onclick');
  }
  document.querySelector('#omnibox__reload-button').onclick = function(e) {
    e.preventDefault();
    console.log('#omnibox__reload-button.onclick');
  }
  document.querySelector('#omnibox__url-input').oninput = function(e) {
    console.log('omnibox__url-input ONINPUT');
    if (!isInput) {
      isInput = true;
      switchOmniboxSmartButton('input');
    }
  };

  browser.setEventListeners({
    'loadstart' : handleLoadStart,
    'loadstop' : handleLoadStop,
    'loadabort' : handleLoadAbort,
    'loadredirect' : handleLoadRedirect,
    'loadcommit' : handleLoadCommit
  });
};

function doLayout() {
  var controls = document.querySelector('#controls');
  var controlsHeight = controls.offsetHeight;
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var webviewWidth = windowWidth;
  var webviewHeight = windowHeight - controlsHeight;

  browser.updateLayout(webviewWidth, webviewHeight);
}

function handleLoadCommit(event) {
  if (!event.isTopLevel) {
    return;
  }

  document.querySelector('#omnibox__url-input').value = event.url;

  var webview = document.querySelector('webview');
  document.querySelector('#back').disabled = !webview.canGoBack();
  document.querySelector('#forward').disabled = !webview.canGoForward();
}

function handleLoadStart(event) {
  isLoading = true;

  if (!event.isTopLevel) {
    return;
  }

  document.querySelector('#omnibox__url-input').value = event.url;
  switchOmniboxSmartButton('loading');
}

function handleLoadStop(event) {
  isLoading = false;
  switchOmniboxSmartButton('loaded');
}

function handleLoadAbort(event) {
  console.log('LoadAbort');
  console.log('  url: ' + event.url);
  console.log('  isTopLevel: ' + event.isTopLevel);
  console.log('  type: ' + event.type);
}

function handleLoadRedirect(event) {
  if (!event.isTopLevel) {
    return;
  }

  document.querySelector('#omnibox__url-input').value = event.newUrl;
}
