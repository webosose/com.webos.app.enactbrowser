// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global window*/

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
            Object.assign({id, isNeva}, message), webview.src);
    }

    handleWebviewMessage = (ev) => {
        if(ev.data && ev.data.action && new URL(this.requests[ev.data.id][ev.data.action].webview.src).origin === ev.origin){
            const data = ev.data;
            if (data) {
                this.requests[data.id][data.action].callback(data);
            } else {
                console.warn('Warning: Message from guest contains no data');
            }
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
        if (this.activeState === 'activated') {
            document.getElementById(rootId).appendChild(this);
        }
    },

    activate: function WebViewMixin_activate() {
        console.log('ACTIVATE ' + this.rootId);
        if (this.activeState === 'deactivated' && this.rootId) {
            document.getElementById(this.rootId).appendChild(this); // TODO: change to reload()
        }
        else if (this.activeState === 'suspended' && WebView.prototype.resume) {
            WebView.prototype.resume.call(this);
        }
        this.activeState = 'activated';
    },

    suspend: function WebViewMixin_suspend() {
        console.log('SUSPEND ' + this.rootId);
        if (this.activeState === 'activated') {
            // Restore WebView content after shifting from VKB if needed
            let script = `
			    if (typeof document_style_transform_backup != "undefined")
				    document.body.style.transform = document_style_transform_backup;
            `;
            this.executeScript({ code: script});
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
            document.getElementById(this.rootId).removeChild(this); // TODO: change to terminate
            this.activeState = 'deactivated';
        }
    },

    // Clears focus for inputting text in web contents of webview
    clearTextInputFocus: function WebViewMixin_clearTextInputFocus() {
        if (this.activeState === 'activated') {
            this.executeScript({code: " \
                if (document.activeElement && ( \
                    document.activeElement.tagName.toLowerCase() === 'input' || \
                    document.activeElement.tagName.toLowerCase() === 'textarea')) { \
                    document.activeElement.blur(); \
                } \
            "});
        }
    },

    navigate: function WebViewMixin_navigate(url) {
        this.src = url;
    },

    back: function WebViewMixin_back() {
        if (this.canGoBack()) {
            WebView.prototype.back.call(this);
        }
    },

    forward: function WebViewMixin_forward() {
        if (this.canGoForward()) {
            WebView.prototype.forward.call(this);
        }
    },

    setZoom: function WebViewMixin_setZoom(zoomFactor) {
        this.zoomFactor = zoomFactor;
        WebView.prototype.setZoom.call(this, zoomFactor);
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
            tabFamilyId: null
        });

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
    return WebViewMixin(document.createElement('webview'), params);
}

export default CustomWebView;
