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

/*global window*/
/*global XMLHttpRequest*/

import {EventEmitter} from './Utilities';

class WebviewMessageProxy {
    constructor() {
        this.counter = 0;
        this.requests = {};
        window.addEventListener('message', this.handleWebviewMessage);
    }

    sendMessage(webview, message, callback) {
        let data = Object.assign({
                id: this.counter,
                isNeva: true
            },
            message
        );
        this.requests[data.id] = {webview, callback};
        this.counter++;
        webview.contentWindow.postMessage(JSON.stringify(data), '*');
        return data.id;
    }

    handleWebviewMessage = (ev) => {
        if (ev.data) {
            const data = JSON.parse(ev.data);
            this.requests[data.id].callback(data);
        } else {
            console.warn('Warning: Message from guest contains no data');
        }
    }

    removeMessageListener(id) {
        delete this.requests[id];
    }
}

let msgProxy = null;

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
// navStateChanged (new nav state)
// newTabRequest
class WebView extends EventEmitter {
    constructor({activeState, ...rest}) {
        super();
        if (!msgProxy) { // initializing global object, as it uses window
            msgProxy = new WebviewMessageProxy();
            console.log(msgProxy);
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
        this.webView.addEventListener('permissionrequest', this.handlePermissionRequest);
        this.webView.setZoom(params.zoomFactor ? params.zoomFactor : 1);
        if (params.useragentOverride) {
            this.webView.setUserAgentOverride(params.useragentOverride);
        }
    }

    handleLoadStart = (ev) => {
        if (ev.isTopLevel) {
            if (this.url !== ev.url) {
                this._scriptInjectionAttempted = false;
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
        }
    }

    handleNewWindow = (ev)  => {
        ev.preventDefault();

        const disposition = ev.windowOpenDisposition;
        if (disposition == 'new_background_tab' || disposition == 'new_foreground_tab') {
            this.emitEvent('newTabRequest', ev);
        }
    }

    handleWebviewLabelScriptInjected = (results) => {
        if (chrome.runtime.lastError) {
            console.warn('Warning: Failed to inject title.js : ' + chrome.runtime.lastError.message);
        } else if (!results || !results.length) {
            console.warn('Warning: Failed to inject title.js results are empty');
        } else {
            // Send a message to the webView so it can get a reference to
            // the embedder
            const obj = this;
            msgProxy.sendMessage(this.webView, {}, (data) => {
                if (data.title !== '[no title]') {
                    obj.emitEvent('titleChange', {title: data.title});
                }
                else {
                    console.warn(
                        'Warning: Expected message from guest to contain {title}, but got:',
                        data);
                }
            });
        }
    }
}

export default WebView;