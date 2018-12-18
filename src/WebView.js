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
        this.nativeWebview = document.createElement('webview');
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
            document.getElementById(rootId).appendChild(this.nativeWebview);
        }
    }

    activate() {
        console.log('ACTIVATE ' + this.rootId);
        if (this.activeState === 'deactivated' && this.rootId) {
            document.getElementById(this.rootId).appendChild(this.nativeWebview);
        }
        else if (this.activeState === 'suspended' && this.nativeWebview.resume) {
            this.nativeWebview.resume();
        }
        this.activeState = 'activated';
    }

    suspend() {
        console.log('SUSPEND ' + this.rootId);
        if (this.activeState === 'activated') {
            if (this.nativeWebview.suspend) {
               this.nativeWebview.suspend();
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
            document.getElementById(this.rootId).removeChild(this.nativeWebview);
            this.activeState = 'deactivated';
        }
    }

    navigate(url) {
        this.nativeWebview.src = url;
    }

    reloadStop() {
        if (this.isLoading) {
            this.nativeWebview.stop();
        }
        else {
            this.nativeWebview.reload();
        }
    }

    back() {
        if (this.nativeWebview.canGoBack()) {
            this.nativeWebview.back();
        }
    }

    forward() {
        if (this.nativeWebview.canGoForward()) {
            this.nativeWebview.forward();
        }
    }

    setZoom(zoomFactor) {
        this.zoomFactor = zoomFactor;
        this.nativeWebview.setZoom(zoomFactor);
    }

    captureVisibleRegion(params) {
        return new Promise((resolve) => {
            this.nativeWebview.captureVisibleRegion(params, (dataUrl) => {
                resolve(dataUrl);
            });
        });
    }

    getNavState() {
        return {
            canGoBack: this.nativeWebview.canGoBack(),
            canGoForward: this.nativeWebview.canGoForward(),
            isLoading: this.isLoading,
            url: this.url
        };
    }

    // Clears browsing data for the webview partition
    clearData(options, types) {
        return new Promise((resolve) => {
            this.nativeWebview.clearData(options, types, () => {
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
        return this.nativeWebview && Object.getOwnPropertyNames(this.nativeWebview).length !== 0;
    }

    _initWebView(params) {
        this.url = params.url ? params.url : '';
        this.isLoading = false;
        // partition assignment shoud be before any assignment of src
        this.nativeWebview.partition = params.partition ? params.partition : '';

        if (!params.newWindow) {
            this.nativeWebview.src = this.url;
        }
        else {
            params.newWindow.attach(this.nativeWebview);
        }

        this.nativeWebview.addEventListener('close', this.handleClose);
        this.nativeWebview.addEventListener('loadstart', this.handleLoadStart);
        this.nativeWebview.addEventListener('loadcommit', this.handleLoadCommit);
        this.nativeWebview.addEventListener('loadstop', this.handleLoadStop);
        this.nativeWebview.addEventListener('loadabort', this.handleLoadAbort);
        this.nativeWebview.addEventListener('newwindow', this.handleNewWindow);
        this.nativeWebview.addEventListener('zoomchange', (ev) =>
            this.emitEvent('zoomChange', ev));
        this.nativeWebview.addEventListener('permissionrequest', this.handlePermissionRequest);
        this.nativeWebview.addEventListener('dialog', (ev) =>
            this.emitEvent('dialog', ev));
        this.nativeWebview.setZoom(params.zoomFactor ? params.zoomFactor : 1);
        if (params.useragentOverride) {
            this.nativeWebview.setUserAgentOverride(params.useragentOverride);
        }
    }

    handleClose = (ev) => {
        this.emitEvent('close', ev);
    }

    handleLoadStart = (ev) => {
        if (ev.isTopLevel) {
            let titleIconChange = false;
            if (this.url !== ev.url) {
                this._scriptInjectionAttempted = false;
                this._scriptInjected = false;
                titleIconChange = true;
            }

            this.url = ev.url;
            this.isAborted = false;
            this.isLoading = true;
            this.emitEvent('navStateChanged', this.getNavState());

            if (titleIconChange) {
                // events for changing title and icon should be after navState
                this.emitEvent('titleChange', {title: ev.url});
                this.emitEvent('iconChange', {favicons: null});
            }
        }
    }

    handleLoadCommit = (ev) => {
        if (ev.isTopLevel && !this.isAborted) {
            if (!this._scriptInjectionAttempted) {
                // Try to inject title-update-messaging script
                this.nativeWebview.executeScript(
                    {'file': 'label.js'},
                    this.handleWebviewLabelScriptInjected
                );
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
            // Send a message to the nativeWebview so it can get a reference to
            // the embedder
            this._scriptInjected = true;
            this.msgListenerId = msgProxy.addMessageListener();
            msgProxy.sendMessage(
                this.msgListenerId,
                this.nativeWebview,
                {action: 'getTitle'},
                (data) => {
                    if (data.title && data.title !== '[no title]') {
                        this.emitEvent('titleChange', {title: data.title});
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
                this.nativeWebview,
                {action: 'getFavicons'},
                (data) => {
                    this.emitEvent(
                        'iconChange',
                        {favicons: data.favicons, rootUrl: data.rootUrl}
                    );
                }
            );
        }
    }
}

export default WebView;
