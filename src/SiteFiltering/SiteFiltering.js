// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
    Blocks webview requests to resources, which urls is not allowed
    by filter
*/
class SiteFiltering {
    constructor(navigatorSiteFilter) {
        this.navigatorSiteFilter = navigatorSiteFilter;
    }
    getURLS(callback) {
        this.navigatorSiteFilter.getURLs((value) => {
            callback(value);
        });
    }
    /*
    *  Off - 0       Approved Sites - 1      Blocked Sites -2
    * This value need to store in the DB and call initial browser launch
    */
    setState(value, callback) {
        //notifySiteFilterState
        const response = this.navigatorSiteFilter.setType(value)
        if (response) {
            this.getURLS(callback);
        }
    }


    /*
    * Add url
    * Allowed or blocked sites decide based on the site filter state
    */
    addURL(url, callback) {
        if (url) {
            const response = this.navigatorSiteFilter.addURL(url);
            if (response) {
                this.getURLS(callback);
            }
        }
    }

    /*
     * Add url
     * Allowed or blocked sites decide based on the site filter state
     */
    updateURL(oldURL, newURL, callback) {
        if (newURL) {
            const response = this.navigatorSiteFilter.updateURL(oldURL, newURL);
            if (response) {
                this.getURLS(callback);
            }
        }
    }

    /*
     * Delete urls
     * Allowed or blocked sites decide based on the site filter state
     * Param isDeleteAll: if true, allow deleting all urls in both Approved
     * and Blocked modes
     */
    deletURLs(urls, isDeleteAll = false, callback) {
        if (urls) {
            this.navigatorSiteFilter.deleteURLs(urls, isDeleteAll, (status) => {
                if (status && callback) {
                    this.getURLS(callback);
                }
            });
        }
    }
}

export default SiteFiltering;
export { SiteFiltering };
