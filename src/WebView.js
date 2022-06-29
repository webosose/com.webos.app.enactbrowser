// Copyright (c) 2018 LG Electronics, Inc.
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

    emit() {
        this.tabView.pageContents.emit(...arguments);
    }

    _initWebView(params) {
        this.canGoBack = false;
        this.canGoForward = false;
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

            if (this.eventListeners[event] === undefined) {
                console.log(`no event listeners for ${event}`);
                return;
            }

            this.eventListeners[event].forEach((callback) => {
                try {
                    callback(ev);
                }
                catch (e) {
                    console.log(`exception occured in ${event} handler (${e})`);
                }
            });
        }

        // It is needed to subscribe to Browser Shell events before adding event listeners with addEventListener
        ['did-start-loading',
         'did-fail-load',
         'did-finish-load',
         'did-start-navigation',
         'did-stop-loading',
         'did-update-favicon-url',
         'dom-ready',
         'laod-progress-changed',
         'page-title-updated',
         'needToUpdateUI',
         'enter-html-fullscreen',
         'leave-html-fullscreen'
        ].forEach(event => {
            this.tabView.pageContents.on(event, tabEventHandlerFactory(event));
        });

        this.addEventListener('did-start-loading', this.handleDidStartLoading.bind(this));
        this.addEventListener('laod-progress-changed', this.handleLoadProgressChanged.bind(this));
        this.addEventListener('did-fail-load', this.handleDidFailLoad.bind(this));
        this.addEventListener('dom-ready', this.handleDomReady.bind(this));
        this.addEventListener('leave-html-fullscreen', this.handleLeaveHtmlFullscreen.bind(this));

        this.setZoom(params.zoomFactor ? params.zoomFactor : 1);
        if (params.useragentOverride) {
            this.setUserAgentOverride(params.useragentOverride);
        }
    }

    handleLeaveHtmlFullscreen(ev) {
        console.log(`Leave HTML fullscreen`);
        this.tabView.pageContents.executeJavaScriptInMainFrame("document.webkitExitFullscreen();");
    }

    adjustBounds() {
        if (!this.rootId)
            return;

        console.log(`WebVIew::adjustBounds`);

        let container_div = document.getElementById(this.rootId);
        let r = container_div.getBoundingClientRect()
        if (r.y < 1) {
            r.y = 1; // pageView should not overlap 'exit fullscreen' button div
                     // (1px heigh)
        }
        console.log(`WVE set position(x:${r.x}, y:${r.y}) (NEVA-6229)`);
        console.log(`WVE set size(width:${r.width}, height:${r.height}) (NEVA-6229)`);
        this.tabView.setBounds(Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height));
    }

    insertIntoDom(rootId) {
        this.rootId = rootId;
        this.adjustBounds();
    }

    activate() {
        QALog('ACTIVATE ' + this.rootId);
        this.tabView.setVisible(true);
        this.tabView.bringToFront();
        if (this.activeState === 'deactivated' && this.rootId) {
            console.log(`WVE activate ${this.rootId} (NEVA-6478)`);
        }
        else if (this.activeState === 'suspended') {
            //WebView.prototype.resume.call(this);
        }
        this.activeState = 'activated';
    }

    suspend() {
        QALog('SUSPEND ' + this.rootId);
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
            //WebView.prototype.suspend.call(this);
            console.warn('Suspend/resume extension is not implemeted');
            this.activeState = 'suspended';
        }
        else if (this.activeState === 'deactivated') {
            console.error('Can\'t suspend webview from deactivated state');
        }
    }

    deactivate() {
        QALog('DEACTIVATE ' + this.rootId);
        if (this.activeState !== 'deactivated') {
            console.log(`WVE deactivate ${this.rootId} (NEVA-6479`);
            this.activeState = 'deactivated';
        }
    }

    navigate(url) {
        console.log(`WebView::navigate`);
        this.tabView.pageContents.loadURL(url)
    }

    back() {
        if (this.canGoBack) {
            this.tabView.pageContents.goBack()
        }
    }

    forward() {
        if (this.canGoForward) {
            this.tabView.pageContents.goForward()
        }
    }

    setZoom(zoomFactor) {
        this.zoomFactor = zoomFactor;
        console.log(`WVE.setZoom (NEVA-6223)`);
    }

    focus() {console.log(`focus`);}

    reload() {
        console.log(`reload`);
        this.tabView.pageContents.reload();
    }

    stop() {
        console.log(`stop`);
        this.tabView.pageContents.stop();
    }

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

    handleDomReady() {
        console.log(`WebView::handleDomReady`);
        this.canGoBack = this.tabView.pageContents.canGoBack;
        this.canGoForward = this.tabView.pageContents.canGoForward;
        console.log(`canGoBack: ${this.canGoBack}, canGoForward: ${this.canGoForward}`);
    }

    handleDidStartLoading () {
        console.log(`WebView::handleDidStartLoading`);
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
                    //this.handleLabelScriptInjected.bind(this)
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
