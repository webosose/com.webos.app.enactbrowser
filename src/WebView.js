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
        pageContentsParams.partition = params.partition ? params.partition : '';

        pageContentsParams["error-page-hidding"] = true;
        pageContentsParams.api = ["v8/browser_shell_ipc", "v8/installablemanager"];

        if (params.zoomFactor) {
            pageContentsParams["zoom-factor"] = params.zoomFactor;
        }

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
        this.id = params.id;
        this.sessionName = params.partition;

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
         'did-finish-navigation',
         'did-push-history-navigation',
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
        this.addEventListener('did-finish-load', this.handleFinishLoading.bind(this));
        this.addEventListener('did-finish-navigation', this.handleFinishNavigation.bind(this));
        this.addEventListener('did-push-history-navigation',this.handlePushHistoryNavigation.bind(this));
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
            defaultPromptText: "",
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
        };

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

        this.dialogData.resetAlertState = () => {
            this.dialogData.alertsAllowed = true;
            this.dialogData.alertsCount = 0;
        };

        this.dialogData.blockDialogsHandler = () => {
            this.dialogData.alertsAllowed = false;
        };

        if (typeof window !== 'undefined' && typeof window.nevaExtensionsManager !== 'undefined') {
            let extensionsService = window.nevaExtensionsManager.getExtensionsServiceFor(this.sessionName);
            if (typeof extensionsService !== 'undefined') {
                extensionsService.extensionTabCreated(this.getPageContentsId());
            }
        }
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
    }

    handleDialog(messageType, messageText, controller, defaultPromptText) {
        console.log(`handleDialog ${this.rootId}>>>`);
        this.dialogData.alertsCount ++;
        this.dialogData.messageType = messageType;
        this.dialogData.messageText = messageText;
        this.dialogData.controller = controller;
        this.dialogData.defaultPromptText = defaultPromptText || "";

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
            defaultPromptText: this.dialogData.defaultPromptText,
            alertsCount: this.dialogData.alertsCount,
            alertsCountBeforePreventionRequest: 3
        }, {});
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

    notifyExtensionOnTabUpdated(tabStatus) {
        if (typeof window !== 'undefined' && typeof window.nevaExtensionsManager !== 'undefined') {
            let extensionsService = window.nevaExtensionsManager.getExtensionsServiceFor(this.sessionName);
            // TODO(neva): Please consider to support other useful fields
            // such as title and url.
            const changeInfo = { status: tabStatus };
            extensionsService.extensionTabUpdated(this.getPageContentsId(), JSON.stringify(changeInfo));
        }
    }

    handleFinishLoading(url, is_main_frame) {
        if (is_main_frame) {
            this.dialogData.resetAlertState();

            this.tabView.pageContents.enableHandShapedCursorForLinks();

            const rcuBackKeyCode = 461;
            this.tabView.pageContents.enableKeyCodeEvent(['Escape', rcuBackKeyCode]);

            this.tabView.pageContents.on('key-event', ({key}) => {
                console.log(`keydown event ${key}`);
                const event = new KeyboardEvent('keydown', {
                    key: key
                });
                document.dispatchEvent(event);
            });
        }
    }

    handleFinishNavigation(url) {
        console.log(`[WebView] handleFinishNavigation ${url}`);
        this.url = url;

        this.canGoBack = this.tabView.pageContents.canGoBack;
        this.canGoForward = this.tabView.pageContents.canGoForward;
        console.log(`canGoBack: ${this.canGoBack}, canGoForward: ${this.canGoForward}`);

        console.log(`[WebView] handleFinishNavigation: focus webview ${this.url}`);
        this.tabView.pageContents.setFocus();

        this.notifyExtensionOnTabUpdated('complete');
    }

    handlePushHistoryNavigation(url) {
        console.log(`[WebView] handlePushHistoryNavigation ${url}`);
        this.url = url;

        this.canGoBack = this.tabView.pageContents.canGoBack;
        this.canGoForward = this.tabView.pageContents.canGoForward;
        console.log(`canGoBack: ${this.canGoBack}, canGoForward: ${this.canGoForward}`);
    }

    handleZoomChange(zoom) {
        this.zoomFactor = zoom;
    }

    adjustBounds(rootId = this.rootId) {
        console.log(`WebVIew::adjustBounds`, rootId);

        if (!rootId)
            return Promise.resolve();

        let container_div = document.getElementById(rootId);
        let r = container_div.getBoundingClientRect();
        if (r.y < 1) {
            r.y = 1; // pageView should not overlap 'exit fullscreen' button div
                     // (1px heigh)
        }
        console.log(`WVE set position(x:${r.x}, y:${r.y}) (NEVA-6229)`);
        console.log(`WVE set size(width:${r.width}, height:${r.height}) (NEVA-6229)`);
        this.tabView.setBounds(Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height));

        if (this.activeState !== 'activated')
            return Promise.resolve();

        return window.dialogOverlay.uioverlay.setBounds({
            bounds: {
                x: Math.round(r.x),
                y: Math.round(r.y),
                w: Math.round(r.width),
                h: Math.round(r.height)
            }, target: 'dialog'});
    }

    insertIntoDom(rootId) {
        this.rootId = rootId;
        this.adjustBounds();
    }

    activate() {
        window.QALog(`ACTIVATE ${this.id} ` + this.url);
        if (this.unresponsive) {
            console.log(`The web page is unresponsive, do not activate`);
            return;
        }

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
        window.shell.shellWindow.pageView.bringToFront(this.tabView);
        this.tabView.pageContents.setFocus();
        this.activeState = 'activated';

        if (typeof window.extensionPopupView === 'object') {
            window.shell.shellWindow.pageView.bringToFront(window.extensionPopupView);
        }

        if (typeof window !== 'undefined' && typeof window.nevaExtensionsManager !== 'undefined') {
            let extensionsService = window.nevaExtensionsManager.getExtensionsServiceFor(this.sessionName);
            extensionsService.extensionTabActivated(this.getPageContentsId());
        }
    }

    suspend() {
        window.QALog(`SUSPEND ${this.id} ` + this.url);
        this.tabView.setVisible(false);
        this.tabView.sendToBack();
        // If suspend error page's DOM it will imposible to show
        // that in other tab
        if ((this.activeState === 'activated') && (!this.isAborted)) {
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
            console.log(`WVE handle vkb (overlap). (NEVA-6205)`);
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
        window.QALog(`DEACTIVATE ${this.id} ` + this.url);
        if (this.activeState !== 'deactivated') {
            this.tabView.pageContents.deactivate();
            this.activeState = 'deactivated';
        }
    }

    exitFullscreen() {
        this.tabView.pageContents.exitFullscreen();
    }

    navigate(url) {
        console.log(`WebView::navigate`);
        this.unresponsive = false;
        if (this.activeState === 'deactivated') {
            this.activate();
        }
        this.url = url;
        this.tabView.pageContents.loadURL(url);
    }

    back() {
        this.unresponsive = false;
        if (this.canGoBack) {
            this.tabView.pageContents.goBack();
        }
    }

    forward() {
        this.unresponsive = false;
        if (this.canGoForward) {
            this.tabView.pageContents.goForward();
        }
    }

    getZoom() {
        return this.tabView.pageContents.zoomFactor;
    }

    setZoom(zoomFactor) {
        this.zoomFactor = zoomFactor;
        this.tabView.pageContents.zoomFactor = this.zoomFactor;
    }

    focus() {console.log(`focus `, this.url);}

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
        if (typeof window !== 'undefined' && typeof window.nevaExtensionsManager !== 'undefined') {
            let extensionsService = window.nevaExtensionsManager.getExtensionsServiceFor(this.sessionName);
            if (typeof extensionsService !== 'undefined') {
                extensionsService.extensionTabClosed(this.getPageContentsId());
            }
        }
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

        this.tabView.pageContents.on('mouse-click-event', (e) => {
            const event = new KeyboardEvent('click', {
                button : e.buttoncode
            });
            document.dispatchEvent(event);
        });

        this.notifyExtensionOnTabUpdated('loading');
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

    handleDidFailLoad(url, is_main_frame, error, error_code) {
        if (is_main_frame) {
            this.isAborted = true;
            this.url = url;
        }
        console.warn("The load has aborted with error " + error + " : " + error_code + ' url = ' + url + ' is main frame ' + is_main_frame);
    }

    getInfo() {
        console.log("[WebView] getInfo >>>");

        return new Promise((resolve, reject) => {
            const ipcChannelName = "ipc_pwa";
            const ipcMessageId = "get_info_resp";

            const injection = `(() => {
                navigator.installablemanager.getInfo((installable, installed) => {
                    const ipc = new ShellIpc("${ipcChannelName}");
                    ipc.post("${ipcMessageId}", {
                        installable,
                        installed
                    });
                });
            })();`;

            const ipc = new ShellIpc(ipcChannelName);

            const onMessage = ({installable, installed}) => {
                console.log("[WebView] getInfo responce received. ", installable, installed);
                clearTimeout(timeout);
                resolve({installable, installed});
            };

            const timeout = setTimeout(() => {
                ipc.removeEventListener(ipcMessageId, onMessage);
                reject("[PWAButton] timeout");
            }, 5000);

            ipc.once(ipcMessageId, onMessage);

            this.tabView.pageContents.executeJavaScriptInMainFrame(injection);
        });

    }

    installApp() {
        console.log("[WebView] installApp >>>");

        return new Promise((resolve, reject) => {
            const ipcChannelName = "ipc_pwa";
            const ipcMessageId = "install_app_resp";

            const injection = `(() => {
                navigator.installablemanager.installApp((pSuccess) => {
                    const ipc = new ShellIpc(\"${ipcChannelName}\");
                    ipc.post(\"${ipcMessageId}\", { pSuccess });
                });
            })();`;

            const ipc = new ShellIpc(ipcChannelName);

            const onMessage = ({pSuccess}) => {
                console.log("[WebView] installApp responce received. ", pSuccess);
                clearTimeout(timeout);
                resolve({pSuccess});
            };

            const timeout = setTimeout(() => {
                ipc.removeEventListener(ipcMessageId, onMessage);
                reject("[PWAButton] timeout");
            }, 5000);

            ipc.once(ipcMessageId, onMessage);

            this.tabView.pageContents.executeJavaScriptInMainFrame(injection);
        });
    }
}

function CustomWebView(params) {
    return new PageContentsWrapper(params);
}

export default CustomWebView;
