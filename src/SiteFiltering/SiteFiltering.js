// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {TabTypes} from '../TabsConsts';

/**
    Blocks webview requests to resources, which urls is not allowed
    by filter
*/
class SiteFiltering {
    constructor(webviews, tabs) {
        Object.assign(this, {filter: null, webviews, tabs});
    }

    /**
        expectcs object with method isAllowed(url):Boolean,
        which returns false, if request to url should be blocked
        OR
        null if you want to disable site filterting
    */
    setFilter(filter) {
        if (filter && !this.filter) {
            // setting filter when no filter is set
            this.tabs.addEventListener('add', this._handleNewTab);
            this.tabs.addEventListener('replace', this._handleNewTab);
            Object.keys(this.webviews).forEach((id) => {
                this._addBeforeRrequestHandlerToWebview(id);
            });
        }
        else if (!filter && this.filter) {
            // removing filter
            this.tabs.removeEventListener('add', this._handleNewTab);
            this.tabs.removeEventListener('replace', this._handleNewTab);
            Object.keys(this.webviews).forEach((id) => {
                this._removeBeforeRequestHandlerFromWebview(id);
            });
        }
        this.filter = filter;
    }

    _addBeforeRrequestHandlerToWebview(id) {
        this.webviews[id].request.onBeforeRequest.addListener(
            this._handleBeforeRequest,
            {urls: ["*://*/*"]},
            ["blocking"]
        );
    }

    _removeBeforeRequestHandlerFromWebview(id) {
        this.webviews[id].request.onBeforeRequest.removeListener(
            this._handleBeforeRequest
        );
    }

    _handleBeforeRequest = ({url, type}) => {
        // check for request type to block only request to web pages
        // and not to block requests to resources such images, fonts, css, etc
        const shouldCancelRequest =
            (type === 'main_frame' || type === 'sub_frame') &&
            this.filter &&
            !this.filter.isAllowed(url);
        return { cancel: shouldCancelRequest };
    }

    _handleNewTab = ({state: {id, type}}) => {
        if (type === TabTypes.WEBVIEW) {
            this._addBeforeRrequestHandlerToWebview(id);
        }
    }
}

export default SiteFiltering;
export {SiteFiltering};
