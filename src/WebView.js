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

    createPageContents(params) {
        let pageContentsParams = {};

        if (params.useragentOverride) {
            console.log(`WebView::_initWebView(user-agent: ${params.useragentOverride})`);
            pageContentsParams["user-agent"] = params.useragentOverride;
        }

        console.log(`WebView::_initWebView(${params.partition})`);
        pageContentsParams["partition"] = params.partition ? params.partition : '';

        pageContentsParams["error-page-hidding"] = true;
        pageContentsParams["api"] = ["v8/browser_shell_ipc"];

        let pageView = new PageView({"page-contents-params": pageContentsParams});

        if (params.newWindow) {
            pageView.pageContents = params.newWindow;
        }

        return pageView;
    }

    _initWebView(params) {
        this.unresponsive = false;
        this.canGoBack = false;
        this.canGoForward = false;
        this.eventListeners = [];
        this.webContentHasLoaded = false;
        this.id = params.id;

        this.tabView = this.createPageContents(params);

        window.shell.shellWindow.pageView.addChildView(this.tabView);

        this.url = params.url ? params.url : '';
        this.isLoading = false;
        // partition assignment should be before any assignment of src

        this.src = this.url;
        this.tabView.pageContents.loadURL(this.url);


        let tabEventHandlerFactory = (event) => (...evArguments) => {
            console.log(`event ${event} occured`);

            if (this.eventListeners[event] === undefined) {
                console.log(`no event listeners for ${event}`);
                return;
            }

            this.eventListeners[event].forEach((callback) => {
                try {
                    callback(...evArguments);
                }
                catch (e) {
                    console.error(`exception occured in ${event} handler (${e})`);
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
         'leave-html-fullscreen',
         'dialog',
         'login',
         'unresponsive',
         'responsive',
         'newwindow',
         'exit',
         'zoomchange',
         'open-url-from-tab',
         'close'
        ].forEach(event => {
            this.tabView.pageContents.on(event, tabEventHandlerFactory(event));
        });

        this.addEventListener('did-start-loading', this.handleDidStartLoading.bind(this));
        this.addEventListener('laod-progress-changed', this.handleLoadProgressChanged.bind(this));
        this.addEventListener('did-fail-load', this.handleDidFailLoad.bind(this));
        this.addEventListener('dom-ready', this.handleDomReady.bind(this));
        this.addEventListener('leave-html-fullscreen', this.handleLeaveHtmlFullscreen.bind(this));
        this.addEventListener('did-finish-load', this.handleFinishLoading.bind(this));
        this.addEventListener('dialog', this.handleDialog.bind(this));
        this.addEventListener('zoomchange', this.handleZoomChange.bind(this));
        this.addEventListener('login', this.handleLogin.bind(this));
        this.addEventListener('unresponsive', this.handleUnresponsive.bind(this));
        this.addEventListener('responsive', this.handleResponsive.bind(this));

        this.dialogData = {
            alertsCount: 0,
            alertsAllowed: true,
            showDialog: false,
            messageType: "",
            messageText: "",
            controller: null,
            responsive: true
        };

        this.dialogData.buttonPressedAuthHandler = ({button, login, password}) => {
            console.log(`WebView::buttonPressedAuthHandler ${this.rootId} ${button} ${login} ${password}`);
            if (button === 'ok') {
                this.dialogData.controller.ok(login, password);
            } else if (button === 'cancel') {
                console.log(`login operation canceled`);
            }
            this.hideDialog();
            this.unsubscribeDialogEvents();
            this.dialogData.showDialog = false;
        }

        this.dialogData.buttonPressedDialogHandler = ({button, text}) => {
            console.log(`WebView::buttonPressedDialogHandler ${this.rootId}`);
            if (button === 'ok') {
                this.dialogData.controller.ok(text);
            } else if (button === 'cancel') {
                this.dialogData.controller.cancel();
            }
            this.hideDialog();
            this.unsubscribeDialogEvents();
            this.dialogData.showDialog = false;
        };

        this.dialogData.blockDialogsHandler = () => {
            this.dialogData.alertsAllowed = false;
        };
    }

    handleUnresponsive() {
        console.log(`WebView::handleUnresponsive`);
        if (this.dialogData.responsive === false) {
            console.log(`[WebView] ::handleUnresponsive ignore duplicate 'unresponsive' event`);
            return;
        }
        this.dialogData.responsive = false;
        this.handleDialog('unresponsive', 'Web page is unresponsive', {
            ok: () => {
                console.log(`ok pressed`);
                // wait for 10 sec
                setTimeout(() => {
                    if (this.dialogData.responsive === false) {
                        this.showDialog();
                    }
                }, 10000);
            },
            cancel: () => {
                console.log(`cancel pressed`);
                let browserBaseIpc = new ShellIpc('ipc_browser_base');
                browserBaseIpc.post('setTabErrorUnresponsive', {id: this.id});
                this.hideDialog();
                this.unresponsive = true;
                this.deactivate();
            }
        });
    }

    handleResponsive() {
        console.log(`WebView::handleResponsive`);
        this.dialogData.responsive = true;
        this.dialogData.showDialog = false;
        this.hideDialog();
    }

    handleLogin(e) {
        console.log(`WebView:: login event ${this.rootId}`);

        this.handleDialog('auth', e.url, {
            ok: (login, password) => e.response(login, password),
            cancel: () => {
                this.dialogData.controller = null;
                console.log(`login dialog cancel called`);
            }
        }); // messageType, messageText, controller
    };

    handleDialog(messageType, messageText, controller) {
        console.log(`handleDialog ${this.rootId}>>>`);
        this.dialogData.alertsCount ++;
        this.dialogData.messageType = messageType;
        this.dialogData.messageText = messageText;
        this.dialogData.controller = controller;

        if (this.dialogData.alertsAllowed) {
            this.dialogData.showDialog = true;
            this.showDialog();
        } else {
            controller.cancel();
        }
    }

    showDialog() {
        if (this.dialogData.alertsAllowed === false) {
            return;
        }

        console.log(`WebView::showDialog ${this.rootId}>>>`);
        const dialog = window.dialogOverlay;

        this.subscribeDialogEvents();

        dialog.show({
            messageType: this.dialogData.messageType,
            messageText: this.dialogData.messageText,
            alertsCount: this.dialogData.alertsCount,
            alertsCountBeforePreventionRequest: 3
        }, this.tabView.getBounds());
    }

    getButtonPressHandler() {
        switch (this.dialogData.messageType) {
            case 'alert':
            case 'confirm':
            case 'prompt':
            case 'unresponsive':
                return this.dialogData.buttonPressedDialogHandler;

            case 'auth':
                return this.dialogData.buttonPressedAuthHandler;

            default:
                return null;
        }
    }

    subscribeDialogEvents() {
        console.log(`subscribeDialogEvents ${this.rootId}`);
        const dialog = window.dialogOverlay;
        dialog.ipc.ipcObject.on('button_pressed', this.getButtonPressHandler().bind(this));
        dialog.ipc.ipcObject.on('block_dialogs', this.dialogData.blockDialogsHandler.bind(this));
    }

    unsubscribeDialogEvents() {
        console.log(`unsubscribeDialogEvents ${this.rootId}`);
        const dialog = window.dialogOverlay;
        dialog.ipc.ipcObject.removeAllEventListeners('button_pressed');
        dialog.ipc.ipcObject.removeAllEventListeners('block_dialogs');
    }

    hideDialog() {
        console.log(`WebView::hideDialog >>>`);
        const dialog = window.dialogOverlay;

        dialog.hide();
    }

    getPageContentsId() {
        return this.tabView.pageContents.id;
    }

    delete() {
        console.log(`WebView::delete ${this.rootId}`);
        this.tabView.pageContents.closeNow();
    }

    handleFinishLoading() {
        this.tabView.pageContents.executeJavaScriptInMainFrame(
            `var style = document.createElement('style')
            style.innerHTML = 'a:-webkit-any-link { cursor: pointer; }'
            document.head.appendChild(style)`
        );

        this.keyDownIpc = new ShellIpc(`keydown_${this.rootId}`);
        this.keyDownIpc.on('keydown', ({key}) => {
            console.log(`keydown event ${key}`);
            const event = new KeyboardEvent('keydown', {
                key : key
            });
            document.dispatchEvent(event);
        });

        this.tabView.pageContents.executeJavaScriptInMainFrame(
            `window.shellIpc = new ShellIpc('keydown_${this.rootId}');
            window.addEventListener('keydown', ({key}) => {
                window.shellIpc.post('keydown', {key: key});
            })`
        );
    }

    handleZoomChange(zoom) {
        this.zoomFactor = zoom;
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

        window.dialogOverlay.uioverlay.setBounds({
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height)
        }, 'dialog');
    }

    insertIntoDom(rootId) {
        this.rootId = rootId;
        this.adjustBounds();
    }

    activate() {
        window.QALog('ACTIVATE ' + this.rootId);
        if (this.unresponsive) {
            console.log(`The web page is unresponsive, do not activate`);
            return;
        }
        this.tabView.setVisible(true);
        this.tabView.bringToFront();

        if (this.dialogData.showDialog === true) {
            this.showDialog();
        }

        if (this.activeState === 'deactivated' && this.rootId) {
            this.tabView.pageContents.resumeDOM();
            this.tabView.pageContents.resumeMedia();
            this.tabView.pageContents.activate();
        }
        else if (this.activeState === 'suspended') {
            this.tabView.pageContents.resumeDOM();
            this.tabView.pageContents.resumeMedia();
        }
        this.tabView.setVisible(true);
        this.tabView.bringToFront();
        this.activeState = 'activated';
    }

    suspend() {
        window.QALog('SUSPEND ' + this.rootId);
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
            this.tabView.pageContents.suspendMedia();
            this.tabView.pageContents.suspendDOM();
            this.activeState = 'suspended';
        }
        else if (this.activeState === 'deactivated') {
            console.error('Can\'t suspend webview from deactivated state');
        }
        this.unsubscribeDialogEvents();
        this.hideDialog();
    }

    deactivate() {
        window.QALog('DEACTIVATE ' + this.rootId);
        if (this.activeState !== 'deactivated') {
            this.tabView.pageContents.deactivate();
            this.activeState = 'deactivated';
        }
    }

    navigate(url) {
        console.log(`WebView::navigate`);
        this.unresponsive = false;
        if (this.activeState === 'deactivated') {
            this.activate();
        }
        this.tabView.pageContents.loadURL(url)
    }

    back() {
        this.unresponsive = false;
        if (this.canGoBack) {
            this.tabView.pageContents.goBack()
        }
    }

    forward() {
        this.unresponsive = false;
        if (this.canGoForward) {
            this.tabView.pageContents.goForward()
        }
    }

    getZoom() {
        return this.tabView.pageContents.zoomFactor;
    }

    setZoom(zoomFactor) {
        this.zoomFactor = zoomFactor;
        this.tabView.pageContents.zoomFactor = this.zoomFactor;
    }

    focus() {console.log(`focus`);}

    reload() {
        console.log(`reload`);
        this.unresponsive = false;
        this.tabView.pageContents.reload();
    }

    stop() {
        console.log(`stop`);
        this.tabView.pageContents.stop();
    }

    captureVisibleRegion(params) {
        return new Promise((resolve) => {
            this.tabView.pageContents.captureVisibleRegion(
                params, (base64_data) => {
                    resolve(base64_data);
                });
        });
    }

    clearData(options, types) {
        console.log(`WebView::clearData`);
        this.tabView.pageContents.clearData(options, types);
    }

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
        this.webContentHasLoaded = false;

        if (!this.onLoadIpc) {
            this.onLoadIpc = new ShellIpc(`onLoadComplete_${this.rootId}`);
            this.onLoadIpc.on('onLoad', () => {
                console.log(`web content has loaded`);
                this.webContentHasLoaded = true;
            });
        }
        console.log(`handleDidStartLoading::executeJavaScriptInMainFrame`);
        this.tabView.pageContents.executeJavaScriptInMainFrame(
            `window.onLoadIpc = new ShellIpc('onLoadComplete_${this.rootId}');
            window.addEventListener('load', () => {
                window.onLoadIpc.post('onLoad', {});
            })
            `
        );
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
