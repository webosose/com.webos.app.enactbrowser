// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global window*/

class WebView_ {}

setTimeout(() => {
    window.WebView = WebView_;
    WebView.prototype.setZoom = () => {console.log(`WVE setZoom (NEVA-6223)`)};
    WebView.prototype.suspend = () => {console.log(`WVE suspend (NEVA-6169)`)};
    WebView.prototype.resume = () => {console.log(`WVE resume (NEVA-6172)`)};
    WebView.prototype.back = () => {console.log(`WVE back (NEVA-6176)`)};
    WebView.prototype.forward = () => {console.log(`WVE forward (NEVA-6178)`)};
    WebView.prototype.captureVisibleRegion = () => {console.log(`WVE captureVisibleRegion (NEVA-6175)`)};
    WebView.prototype.clearData = () => {console.log(`WVE clearData (NEVA-6212)`)};
}, 0);

class WebviewMessageProxy {
    constructor() {
        this.counter = 0;
        this.requests = {};
        window.addEventListener('message', this.handleWebviewMessage);
    }

    sendMessage(id, webview, message, callback) {
        if (!this.requests[id]) {
            console.warn('Can\'t send message for webview, as it doesn\'t have msgListenerId');
            return;
        }

        const
            action = message.action,
            isNeva = true;
        if (callback) {
            this.requests[id][action] = {webview, callback};
        }
        webview.contentWindow.postMessage(
            Object.assign({id, isNeva}, message), '*');
    }

    handleWebviewMessage = (ev) => {
        const data = ev.data;
        if (data) {
            this.requests[data.id][data.action].callback(data);
        } else {
            console.warn('Warning: Message from guest contains no data');
        }
    }

    addMessageListener() {
        this.requests[this.counter] = {};
        return this.counter++;
    }

    removeMessageListener(id) {
        delete this.requests[id];
    }
}

let msgProxy = null;

const WebViewMixinBase = {
    insertIntoDom: function WebViewMixin_insertIntoDom(rootId) { // TODO: remove unnecessary function
        this.rootId = rootId;
        let container_div = document.getElementById(rootId);
        let r = container_div.getBoundingClientRect()
        console.log(`WVE set position(x:${r.x}, y:${r.y}) (NEVA-6229)`);
        console.log(`WVE set size(width:${r.width}, height:${r.height}) (NEVA-6229)`);
    },

    activate: function WebViewMixin_activate() {
        console.log('ACTIVATE ' + this.rootId);
        if (this.activeState === 'deactivated' && this.rootId) {
            console.log(`WVE activate ${this.rootId} (NEVA-6478)`);
        }
        else if (this.activeState === 'suspended' && WebView.prototype.resume) {
            WebView.prototype.resume.call(this);
        }
        this.activeState = 'activated';
    },

    suspend: function WebViewMixin_suspend() {
        console.log('SUSPEND ' + this.rootId);
        if (this.activeState === 'activated') {
            let script = `
                var elements = document.body.getElementsByClassName('vkbInset');
                if (elements.length !== 0) {
                    window.scrollTo(0, window.pageYOffset - parseInt(elements[0].style.height));
                    for (let i = elements.length - 1; i >= 0; --i) {
                        elements[i].remove();
                    }
                }
            `;
            script += `document.activeElement.blur();`;
            console.log(`WVE handle vkb (overlap). (NEVA-6205)`)
            if (WebView.prototype.suspend) {
                WebView.prototype.suspend.call(this);
            }
            else {
                console.warn('Suspend/resume extension is not implemeted');
            }
            this.activeState = 'suspended';
        }
        else if (this.activeState === 'deactivated') {
            console.error('Can\'t suspend webview from deactivated state');
        }
    },

    deactivate: function WebViewMixin_deactivate() {
        console.log('DEACTIVATE ' + this.rootId);
        if (this.activeState !== 'deactivated') {
            console.log(`WVE deactivate ${this.rootId} (NEVA-6479`);
            this.activeState = 'deactivated';
        }
    },

    navigate: function WebViewMixin_navigate(url) {
        const event = new CustomEvent('navigate', {
            detail: {
                call_after_render: () => this.src = url
            }
        });
        this.dispatchEvent(event);
    },

    back: function WebViewMixin_back() {
        if (this.canGoBack()) {
            const event = new CustomEvent('navigate', {
                detail: {
                    call_after_render: () => WebView.prototype.back.call(this)
                }
            });
            this.dispatchEvent(event);
        }
    },

    forward: function WebViewMixin_forward() {
        if (this.canGoForward()) {
            const event = new CustomEvent('navigate', {
                detail: {
                    call_after_render: () => WebView.prototype.forward.call(this)
                }
            });
            this.dispatchEvent(event);
        }
    },

    setZoom: function WebViewMixin_setZoom(zoomFactor) {
        this.zoomFactor = zoomFactor;
        console.log(`WVE.setZoom (NEVA-6223)`);
    },

    captureVisibleRegion: function WebViewMixin_captureVisibleRegion(params) {
        return new Promise((resolve) => {
            WebView.prototype.captureVisibleRegion.call(
                this, params, (dataUrl) => {
                    resolve(dataUrl);
            });
        });
    },

    // Clears browsing data for the webview partition
    clearData: function WebViewMixin_clearData(options, types) {
        return new Promise((resolve) => {
            WebView.prototype.clearData.call(
                this, options, types, () => {
                    resolve();
            });
        });
    },

    // should be called before webview destruction to prevent memory leak
    beforeWebviewDelete: function WebViewMixin_beforeWebviewDelete() {
        if (this.msgListenerId !== null) {
            msgProxy.removeMessageListener(this.msgListenerId);
        }
    },

    _initWebView: function WebViewMixin_initWebView(params) {
        this.url = params.url ? params.url : '';
        this.isLoading = false;
        // partition assignment should be before any assignment of src
        this.partition = params.partition ? params.partition : '';

        if (!params.newWindow) {
            this.src = this.url;
        }
        else {
            params.newWindow.attach(this);
        }

        this.addEventListener('loadstart', this.handleLoadStart.bind(this));
        this.addEventListener('loadcommit', this.handleLoadCommit.bind(this));
        this.addEventListener('loadabort', this.handleLoadAbort.bind(this));

        this.setZoom(params.zoomFactor ? params.zoomFactor : 1);
        if (params.useragentOverride) {
            this.setUserAgentOverride(params.useragentOverride);
        }

    },

    handleLoadStart: function WebViewMixin_handleLoadStart(ev) {
        if (ev.isTopLevel) {
            this._scriptInjectionAttempted = false;
            this._scriptInjected = false;
            this.isAborted = false;
            this.isAlertsAllowed = true;
            this.alertsCount = 0;
        }
    },

    handleLoadCommit: function WebViewMixin_handleLoadCommit(ev) {
        if (ev.isTopLevel && !this.isAborted) {
            if (!this._scriptInjectionAttempted) {
                // Try to inject title-update-messaging script
                this.executeScript(
                    {'file': 'label.js'},
                    this.handleLabelScriptInjected.bind(this)
                );
                this._scriptInjectionAttempted = true;
            }
        }
    },

    handleLoadAbort: function WebViewMixin_handleLoadAbort(ev) {
        if (ev.isTopLevel) {
            this.isAborted = true;
        }
        else {
            console.warn("The load has aborted with error " + ev.code + " : " + ev.reason + ' url = ' + ev.url);
        }
    },

    handleLabelScriptInjected: function handleLabelScriptInjected(results) {
        if (chrome.runtime.lastError) {
            console.warn('Warning: Failed to inject title.js : ' + chrome.runtime.lastError.message);
        } else if (!results || !results.length) {
            console.warn('Warning: Failed to inject title.js results are empty');
        } else {
            // Send a message to the <webview> so it can get a reference to
            // the embedder
            this._scriptInjected = true;
            this.msgListenerId = msgProxy.addMessageListener();
            msgProxy.sendMessage(
                this.msgListenerId,
                this,
                {action: 'getTitle'},
                (data) => {
                    if (data.title && data.title !== '[no title]') {
                        const event = new CustomEvent('titlechange', {detail: {title: data.title}});
                        this.dispatchEvent(event);
                    }
                    else {
                        console.warn(
                            'Warning: Expected message from guest to contain title, but got:',
                            data);
                    }
                }
            );
            msgProxy.sendMessage(
                this.msgListenerId,
                this,
                {action: 'getFavicons'},
                (data) => {
                    const event = new CustomEvent(
                        'iconchange',
                        {detail: {favicons: data.favicons, rootUrl: data.rootUrl}}
                    );
                    this.dispatchEvent(event);
                }
            );
        }
    }
}

function WebViewMixin(webView, {activeState, ...rest}) {
    Object.assign(webView, WebViewMixinBase, {
            activeState,
            _scriptInjectionAttempted: false,
            rootId: null,
            isAborted: false,
            msgListenerId: null,
            isAlertsAllowed: true,
            alertsCount: 0,
            tabFamilyId: null
        });
        Object.assign(webView, WebView_, {
            reload: function mixin_reload() {
                console.log(`WVE reload (NEVA-6155)`)
            }
        })

    // TODO: use local property and Singleton
    if (!msgProxy) { // initializing global object, as it uses window
        msgProxy = new WebviewMessageProxy();
    }

    webView._initWebView(rest);

    return webView;
}

/*
    <webview> tag can't be extended via customElement.define(), it seems
    that when custom <webview> is created it can't insert shadow dom (exception
    is thrown). The only possible way to extend functionality of <webview> is
    to add new properties dynamicaly to newly created instance of <webview>.
    The drawback of this solution is that we can't use <webview> tag in markup.
    We should create webview via CustomWebView function and insert it to DOM.
*/
function CustomWebView(params) {
    console.log(`WVE Create WVE (NEVA-6474)`)
    return WebViewMixin(document.createElement('div'), params);
}

export default CustomWebView;
