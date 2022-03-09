// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global window*/

class PageContentsWrapper {
    constructor(params) {
        this.activeState = 'activated';
        this._scriptInjectionAttempted = false;
        this.rootId = null;
        this.isAborted = false;
        this.msgListenerId = null;
        this.isAlertsAllowed = true;
        this.alertsCount = 0;
        this.tabFamilyId = null;
        this._initWebView(params);
    }
    
    addEventListener(event, callback) {
        console.log(`pageContents addEventListener(${event}, ...)`);
        if (!this.eventListeners[event])
            this.eventListeners[event] = [];
        this.eventListeners[event].push(callback);
    }

    _initWebView(params) {
        this.eventListeners = [];
        this.tabView = new PageView;
        window.shell.shellWindow.pageView.addChildView(this.tabView);

        this.url = params.url ? params.url : '';
        this.isLoading = false;
        // partition assignment should be before any assignment of src
        this.partition = params.partition ? params.partition : '';

        if (!params.newWindow) {
            this.src = this.url;
            this.tabView.pageContents.loadURL(this.url);
        }
        else {
            params.newWindow.attach(this);
        }

        let tabEventHandlerFactory = (event) => (ev) => {
            console.log(`event ${event} occured`);
            this.eventListeners[event].forEach(callback => callback(ev));
        }

        // It is needed to subscribe to Browser Shell events before adding event listeners with addEventListener
        ['did-start-loading',
         'did-fail-load',
         'did-finish-load',
         'did-start-navigation',
         'did-stop-loading',
         'dom-ready',
         'laod-progress-changed',
         'page-title-updated',
        ].forEach(event => {
            this.tabView.pageContents.on(event, tabEventHandlerFactory(event));
        });

        this.addEventListener('did-start-loading', this.handleDidStartLoading.bind(this));
        this.addEventListener('laod-progress-changed', this.handleLoadProgressChanged.bind(this));
        this.addEventListener('did-fail-load', this.handleDidFailLoad.bind(this));

        this.setZoom(params.zoomFactor ? params.zoomFactor : 1);
        if (params.useragentOverride) {
            this.setUserAgentOverride(params.useragentOverride);
        }
    }

    insertIntoDom(rootId) { // TODO: remove unnecessary function
        this.rootId = rootId;
        let container_div = document.getElementById(rootId);
        let r = container_div.getBoundingClientRect()
        console.log(`WVE set position(x:${r.x}, y:${r.y}) (NEVA-6229)`);
        console.log(`WVE set size(width:${r.width}, height:${r.height}) (NEVA-6229)`);
        this.tabView.setBounds(Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height));
    }

    activate() {
        console.log('ACTIVATE ' + this.rootId);
        this.tabView.setVisible(true);
        this.tabView.bringToFront();
        if (this.activeState === 'deactivated' && this.rootId) {
            console.log(`WVE activate ${this.rootId} (NEVA-6478)`);
        }
        else if (this.activeState === 'suspended' && WebView.prototype.resume) {
            WebView.prototype.resume.call(this);
        }
        this.activeState = 'activated';
    }

    suspend() {
        console.log('SUSPEND ' + this.rootId);
        this.tabView.setVisible(false);
        this.tabView.sendToBack();
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
    }

    deactivate() {
        console.log('DEACTIVATE ' + this.rootId);
        if (this.activeState !== 'deactivated') {
            console.log(`WVE deactivate ${this.rootId} (NEVA-6479`);
            this.activeState = 'deactivated';
        }
    }

    canGoBack() {
        console.log(`pageContents canGoBack`);
        if (this.tabView.pageContents.canGoBack) {
            return this.tabView.pageContents.canGoBack();
        } else {
            console.log(`pageContents.canGoBack() not implemented`);
            return false;
        }
    }

    canGoForward() {
        console.log(`pageContents canGoForward`);
        if (this.tabView.pageContents.canGoForward) {
            return this.tabView.pageContents.canGoForward();
        } else {
            console.log(`pageContents.canGoForward() not implemented`);
            return false;
        }
    }

    navigate(url) {
        console.log(`navigate`);
        this.url = url;
        const event = new CustomEvent('navigate', {
            detail: {
                call_after_render: () => this.tabView.pageContents.loadURL(url)
            }
        });
        this.dispatchEvent(event);
    }

    back() {
        if (this.tabView.pageContents.canGoBack()) {
            const event = new CustomEvent('navigate', {
                detail: {
                    call_after_render: () => this.tabView.pageContents.goBack()
                }
            });
            this.dispatchEvent(event);
        }
    }

    forward() {
        if (this.tabView.pageContents.canGoForward()) {
            const event = new CustomEvent('navigate', {
                detail: {
                    call_after_render: () => this.tabView.pageContents.goForward()
                }
            });
            this.dispatchEvent(event);
        }
    }

    setZoom(zoomFactor) {
        this.zoomFactor = zoomFactor;
        console.log(`WVE.setZoom (NEVA-6223)`);
    }

    focus() {console.log(`focus`);}

    reload() {console.log(`reload`);}

    captureVisibleRegion(params) {
        console.log(`captureVisibleRegion`);
        /* TDB: reimplement it
          return new Promise((resolve) => {
            WebView.prototype.captureVisibleRegion.call(
                this, params, (dataUrl) => {
                resolve(dataUrl);
            });
            });*/
        return new Promise((resolve) => {});
    }

    clearData() {console.log(`clearData`);}
    beforeWebviewDelete() {
        console.log(`beforeWebviewDelete`);
        // TBD !! remove event listeners
    }

    handleDidStartLoading () {
        console.log(`handleDidStartLoading`);
        this._scriptInjectionAttempted = false;
        this._scriptInjected = false;
        this.isAborted = false;
        this.isAlertsAllowed = true;
        this.alertsCount = 0;
    }

    handleLoadProgressChanged(ev) {
        if (!this.isAborted) {
            if (!this._scriptInjectionAttempted) {
                // Try to inject title-update-messaging script
                this.executeScript(
                    {'file': 'label.js'},
                    this.handleLabelScriptInjected.bind(this)
                );
                this._scriptInjectionAttempted = true;
            }
        }
    }

    handleDidFailLoad(ev) {
        this.isAborted = true;
        console.warn("The load has aborted with error " + ev.code + " : " + ev.reason + ' url = ' + ev.url);
    }
};

function CustomWebView(params) {
    return new PageContentsWrapper(params);
};

export default CustomWebView;
