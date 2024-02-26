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
    constructor(partition_id) {
        Object.assign(this, {filter: null});
        this.partition_id = partition_id;
    }

    /**
        expectcs object with method isAllowed(url):Boolean,
        which returns false, if request to url should be blocked
        OR
        null if you want to disable site filterting
    */
    setFilter(filter) {
        console.log(`SiteFiltering::setFilter`);
        if (filter && !this.filter) {
            // setting filter when no filter is set
            this._addBeforeRequestHandler();
        }
        else if (!filter && this.filter) {
            // removing filter
            this._removeBeforeRequestHandler();
        }
        this.filter = filter;
    }

    getDomain(url) {
        let domain = url;
        try {
            domain = (new URL(url)).hostname;
        } catch (error) {
            console.warn('Error getDomain: ' + error.message);
        }
        const wwwPrefix = 'www.';
        if (domain && domain.startsWith(wwwPrefix)) {
            domain = domain.replace(wwwPrefix, '');
        }
        return domain;
    }

    _addBeforeRequestHandler() {
        console.log(`SiteFiltering::_addBeforeRequestHandler`);
        shell.session(this.partition_id).webrequest.onBeforeRequest(
            { urls: ["*://*/*"] },
            ({url, resourceType}) => {
                console.log(`SiteFiltering:: check ${url} ${resourceType}`);
                const shouldCancelRequest =
                    (resourceType === 'mainFrame' || resourceType === 'subFrame') &&
                    this.filter && !this.filter.isAllowed(this.getDomain(url)); // parse url string to check is it in a list
                    console.log(`SiteFiltering:: check returns cancel: ${shouldCancelRequest}`);
                return { cancel: shouldCancelRequest };
            }
        );
    }

    _removeBeforeRequestHandler() {
        console.log(`SiteFiltering::_removeBeforeRequestHandler`);
        shell.session(this.partition_id).webrequest.onBeforeRequest(null);
    }
}

export default SiteFiltering;
export {SiteFiltering};
