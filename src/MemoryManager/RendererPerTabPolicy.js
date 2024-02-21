// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {TabTypes} from '../TabsConsts';

class RendererPerTabPolicy {
    constructor(tabs, webViews, maxActiveTabFamilies, maxSuspendedTabFamilies) {
        this.webViews = webViews;
        this.queue = [];
        this.maxActiveTabFamilies = maxActiveTabFamilies;
        this.maxSuspendedTabFamilies = maxSuspendedTabFamilies;
        tabs.addEventListener('select', this._handleTabSelect);
        tabs.addEventListener('delete', this._handleTabDelete);
    }

    /* jshint ignore:start */
    // do <action> with all members of tab family with <family_id>.
    manageTabFamily = (action) => (family_id) => {
        this.webViews.forEach((webView, index) => {
            if (this.webViews[index].tabFamilyId === family_id) {
                action(index);
            }
        });
    };

    activateTabFamily = this.manageTabFamily(
        id => this.webViews[id].activate()
    );

    suspendTabFamily = this.manageTabFamily(
        id => this.webViews[id].suspend()
    );

    deactivateTabFamily = this.manageTabFamily(
        id => this.webViews[id].deactivate()
    );

    _handleTabSelect = (ev) => {
        const tab = ev.state;
        const history = tab.navState.history;
        const type = history.entries[history.index];

        if (type !== TabTypes.WEBVIEW) {
            if (this.queue.length > 0) {
              this.suspendTabFamily(this.queue[0]);
            }
            return;
        }
        const viewId = history.views[history.index];

        let tab_family_id = this.webViews[viewId].tabFamilyId;

        this.queue.unshift(tab_family_id);
        this.queue = [...new Set(this.queue)]; // remove duplicates

        console.log(`tab family id: ${tab_family_id}. this.queue: ${this.queue.toString()}`);

        if (this.maxSuspendedTabFamilies > 0) {
            if (this.queue.length > this.maxActiveTabFamilies) {
                this.suspendTabFamily(this.queue[this.maxActiveTabFamilies]);
            }
        }

        const maxNotDeactivated = this.maxActiveTabFamilies + this.maxSuspendedTabFamilies;

        if (this.queue.length > maxNotDeactivated) {
            this.deactivateTabFamily(this.queue.pop());
        }

        this.activateTabFamily(tab_family_id);
    }

    _handleTabDelete = (ev) => {
        const tab = ev.state;
        if (tab.type !== TabTypes.WEBVIEW) {
            return;
        }

        this.queue = this.queue.filter((tab_family_id) => {
            // if there are at least one tab family member
            let result = this.webViews.find((webView, index, views) => {
                if (views[index] === undefined) {
                    return false;
                }
                return views[index].tabFamilyId === tab_family_id;
            });
            return result !== undefined;
        });
    }
    /* jshint ignore:end */
}

export default RendererPerTabPolicy;
export {RendererPerTabPolicy};
