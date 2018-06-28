import {EventEmitter} from './Utilities';

// webview wrapper, which handles some code boilerplate
// events:
// navStateChanged (new nav state)
// newTabRequest
class WebView extends EventEmitter {
    constructor({activeState, ...rest}) {
        super();
        this.webView = document.createElement('webview');
        this._scriptInjectionAttempted = false;
        this.rootId = null;
        this.activeState = activeState;
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
        if (this.activeState === 'deactivated' && this.rootId) {
            document.getElementById(this.rootId).appendChild(this.webView);
        }
        else if (this.activeState === 'suspended' && this.webView.resume) {
            this.webView.resume();
        }
        this.activeState = 'activated';
    }

    suspend() {
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

    _isWebViewLoaded() {
        return this.webView && Object.getOwnPropertyNames(this.webView).length !== 0;
    }

    _initWebView(params) {
        this.url = params.url ? params.url : '';
        this.addEventListener('navStateChanged', params.onNavStateChanged);
        this.addEventListener('newTabRequest', params.onNewTab);
        this.onLabelScriptInjected = params.onLabelScriptInjected ? params.onLabelScriptInjected : null;

        this.isLoading = false;
        // partition assignment shoud be before any assignment of src
        this.webView.partition = params.partition ? params.partition : '';
        this.webView.src = this.url;
        this.webView.addEventListener('loadstart', this.handleLoadStart);
        this.webView.addEventListener('loadcommit', this.handleLoadCommit);
        this.webView.addEventListener('loadstop', this.handleLoadStop);
        this.webView.addEventListener('loadabort', this.handleLoadAbort);
        this.webView.addEventListener('newwindow', this.handleNewWindow);
        this.webView.addEventListener('permissionrequest', this.handleNewWindow);
        this.webView.setZoom(params.zoomFactor ? params.zoomFactor : 1);
    }

    handleLoadStart = (ev) => {
        if (ev.isTopLevel) {
            if (this.url !== ev.url) {
                this._scriptInjectionAttempted = false;
            }
            this.url = ev.url;
            this.isLoading = true;
            this.emitEvent('navStateChanged', this.getNavState());
        }
    }

    handleLoadCommit = (ev) => {
        if (ev.isTopLevel && this.url !== ev.url) {
            this.url = ev.url;
            this.emitEvent('navStateChanged', this.getNavState());
        }
    }

    handleLoadStop = () => {
        this.isLoading = false;

        if (this.onLabelScriptInjected && !this._scriptInjectionAttempted) {
            // Try to inject title-update-messaging script
            this.webView.executeScript(
                {'file': 'resources/label.js'},
                this.onLabelScriptInjected
            );
            this._scriptInjectionAttempted = true;
        }

        this.emitEvent('navStateChanged', this.getNavState());
    }

    handleLoadAbort = (ev) => {
        ev.preventDefault();
        let top = ev.isTopLevel ? "top " : "";
        console.warn("The " + top + "load has aborted with error " + ev.code + " : " + ev.reason + ' url = ' + ev.url);
    }

    handlePermissionRequest = () => {
        console.warn("Permission request recieved");
    }

    handleNewWindow = (ev)  => {
        ev.preventDefault();

        const disposition = ev.windowOpenDisposition;
        if (disposition == 'new_background_tab' || disposition == 'new_foreground_tab') {
            this.emitEvent('newTabRequest', ev);
        }
    }
}

export default WebView;