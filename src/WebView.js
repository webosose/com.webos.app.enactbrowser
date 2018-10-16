// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global window*/
/*global XMLHttpRequest*/

import {EventEmitter} from './Utilities';

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

// workaround to obtain favicon of a website
// in most cases it works
function getFavicon(url, callback) {
    const matches = url.match(/^(.*:\/\/[^\/]*)/);
    if (matches) {
        const requestUrl = matches[0] + '/favicon.ico';
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 &&
                xhr.status === 200 &&
                xhr.response) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    callback(ev.target.result);
                }
                reader.readAsDataURL(xhr.response);
            }
        };
        xhr.responseType = "blob";
        xhr.open('GET', requestUrl, true);
        xhr.send();
    }
}

// webview wrapper, which handles some code boilerplate
// events:
// - navStateChanged (new nav state)
// - newWindowRequest
// - titleChange
// - iconChange
// - loadAbort
class WebView extends EventEmitter {
    constructor({activeState, ...rest}) {
        super();
        if (!msgProxy) { // initializing global object, as it uses window
            msgProxy = new WebviewMessageProxy();
        }
        this.webView = document.createElement('webview');
        this._scriptInjectionAttempted = false;
        this.rootId = null;
        this.activeState = activeState;
        this.isAborted = false;
        this.msgListenerId = null;
        // This code handles specific behavior of React
        // If we create webview and assign properties to it before first app render finished
        // this properties will be overwritten after this render
        if (this._isWebViewLoaded()) {
            this._initWebView(rest);
        }
        else {
            document.addEventListener('DOMContentLoaded', () => { this._initWebView(params); });
        }
    }

    // Shoud be called when DOM is ready
    insertIntoDom(rootId) {
        this.rootId = rootId;
        if (this.activeState === 'activated') {
            document.getElementById(rootId).appendChild(this.webView);
        }
    }

    activate() {
        console.log('ACTIVATE ' + this.rootId);
        if (this.activeState === 'deactivated' && this.rootId) {
            document.getElementById(this.rootId).appendChild(this.webView);
        }
        else if (this.activeState === 'suspended' && this.webView.resume) {
            this.webView.resume();
        }
        this.activeState = 'activated';
    }

    suspend() {
        console.log('SUSPEND ' + this.rootId);
        if (this.activeState === 'activated') {
            if (this.webView.suspend) {
               this.webView.suspend();
            }
            else {
                console.warn('Suspend/resume extension is not implemeted');
            }
            this.activeState = 'suspended';
        }
        else if (this.activeState === 'deactivated') {
            console.error('Can\'t suspend webview from deactivated state');
        }
    }

    deactivate() {
        console.log('DEACTIVATE ' + this.rootId);
        if (this.activeState !== 'deactivated') {
            document.getElementById(this.rootId).removeChild(this.webView);
            this.activeState = 'deactivated';
        }
    }

    navigate(url) {
        this.webView.src = url;
    }

    reloadStop() {
        if (this.isLoading) {
            this.webView.stop();
        }
        else {
            this.webView.reload();
        }
    }

    back() {
        if (this.webView.canGoBack()) {
            this.webView.back();
        }
    }

    forward() {
        if (this.webView.canGoForward()) {
            this.webView.forward();
        }
    }

    setZoom(zoomFactor) {
        this.zoomFactor = zoomFactor;
        this.webView.setZoom(zoomFactor);
    }

    captureVisibleRegion(params) {
        return new Promise((resolve) => {
            this.webView.captureVisibleRegion(params, (dataUrl) => {
                resolve(dataUrl);
            });
        });
    }

    getNavState() {
        return {
            canGoBack: this.webView.canGoBack(),
            canGoForward: this.webView.canGoForward(),
            isLoading: this.isLoading,
            url: this.url
        };
    }

    // Clears browsing data for the webview partition
    clearData(options, types) {
        return new Promise((resolve) => {
            this.webView.clearData(options, types, () => {
                resolve();
            });
        });
    }

    // should be called before webview destruction to prevent memory leak
    beforeWebviewDelete() {
        if (this.msgListenerId !== null) {
            msgProxy.removeMessageListener(this.msgListenerId);
        }
    }

    _isWebViewLoaded() {
        return this.webView && Object.getOwnPropertyNames(this.webView).length !== 0;
    }

    _initWebView(params) {
        this.url = params.url ? params.url : '';
        this.isLoading = false;
        // partition assignment shoud be before any assignment of src
        this.webView.partition = params.partition ? params.partition : '';
        this.webView.src = this.url;
        this.webView.addEventListener('loadstart', this.handleLoadStart);
        this.webView.addEventListener('loadcommit', this.handleLoadCommit);
        this.webView.addEventListener('loadstop', this.handleLoadStop);
        this.webView.addEventListener('loadabort', this.handleLoadAbort);
        this.webView.addEventListener('newwindow', this.handleNewWindow);
        this.webView.addEventListener('zoomchange', (ev) =>
            this.emitEvent('zoomChange', ev));
        this.webView.addEventListener('permissionrequest', this.handlePermissionRequest);
        this.webView.addEventListener('dialog', (ev) =>
            this.emitEvent('dialog', ev));
        this.webView.setZoom(params.zoomFactor ? params.zoomFactor : 1);
        if (params.useragentOverride) {
            this.webView.setUserAgentOverride(params.useragentOverride);
        }
    }

    handleLoadStart = (ev) => {
        if (ev.isTopLevel) {
            if (this.url !== ev.url) {
                this._scriptInjectionAttempted = false;
                this._scriptInjected = false;
                this.emitEvent('titleChange', {title: ev.url});
                this.emitEvent('iconChange', {icon: null});
            }

            this.url = ev.url;
            this.isAborted = false;
            this.isLoading = true;
            this.emitEvent('navStateChanged', this.getNavState());
        }
    }

    handleLoadCommit = (ev) => {
        if (ev.isTopLevel && !this.isAborted) {
            if (!this._scriptInjectionAttempted) {
                // Try to inject title-update-messaging script
                this.webView.executeScript(
                    {'file': 'label.js'},
                    this.handleWebviewLabelScriptInjected
                );
                getFavicon(this.url, (binaryImg) => {
                    if (binaryImg) {
                        this.emitEvent('iconChange', {icon: binaryImg});
                    }
                });
                this._scriptInjectionAttempted = true;
            }
            if (this.url !== ev.url) {
                this.url = ev.url;
                this.emitEvent('navStateChanged', this.getNavState());
            }
        }
    }

    handleLoadStop = () => {
        this.isLoading = false;
        this.emitEvent('navStateChanged', this.getNavState());
    }

    handleLoadAbort = (ev) => {
        if (ev.isTopLevel) {
            this.isAborted = true;
            this.emitEvent('loadAbort', {reason: ev.reason});
        }
        else {
            console.warn("The load has aborted with error " + ev.code + " : " + ev.reason + ' url = ' + ev.url);
        }
    }

    handlePermissionRequest = (ev) => {
        switch (ev.permission) {
            case 'fullscreen':
                ev.request.allow();
                break;
            default:
                console.warn("Permission request recieved: " + ev.permission);
                ev.request.deny();
        }
    }

    handleNewWindow = (ev)  => {
        this.emitEvent('newWindowRequest', ev);
    }

    handleWebviewLabelScriptInjected = (results) => {
        if (chrome.runtime.lastError) {
            console.warn('Warning: Failed to inject title.js : ' + chrome.runtime.lastError.message);
        } else if (!results || !results.length) {
            console.warn('Warning: Failed to inject title.js results are empty');
        } else {
            // Send a message to the webView so it can get a reference to
            // the embedder
            this._scriptInjected = true;
            this.msgListenerId = msgProxy.addMessageListener();
            const obj = this;
            msgProxy.sendMessage(
                this.msgListenerId,
                this.webView,
                {action: 'getTitle'},
                (data) => {
                    if (data.title && data.title !== '[no title]') {
                        obj.emitEvent('titleChange', {title: data.title});
                    }
                    else {
                        console.warn(
                            'Warning: Expected message from guest to contain title, but got:',
                            data);
                    }
            });
        }
    }
}

export default WebView;
