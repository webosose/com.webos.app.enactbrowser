// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {TabTypes} from 'js-browser-lib/TabsConsts';

class RendererPerTabPolicy {
    constructor (tabs, webViews, maxActiveTabFamilies, maxSuspendedTabFamilies) {
        this.webViews = webViews;
        this.queue = [];
        this.maxActiveTabFamilies = maxActiveTabFamilies;
        this.maxSuspendedTabFamilies = maxSuspendedTabFamilies;
        tabs.addEventListener('select', this._handleTabSelect);
        tabs.addEventListener('delete', this._handleTabDelete);
    }

    _handleTabSelect = (ev) => {
        const tab = ev.state;

        // VKB for current tab should be hidden when the other tab is selected
        if (this.queue.length > 0) {
            this.webViews[this.queue[0]].clearTextInputFocus();
        }

        if (tab.type !== TabTypes.WEBVIEW) {
            return;
        }

        let tab_family_id = this.webViews[tab.id].tabFamilyId;
        this.queue.unshift(tab_family_id);
        this.queue = [...new Set(this.queue)]; // remove duplicates
        
        // do <action> with all members of tab family with <family_id>.
        let manage_tab_family = (action) => (family_id) => {
            this.webViews.forEach((webView, index) => {
                if (this.webViews[index].tabFamilyId === family_id) {
                    action(index);
                }
            });
        };
        
        let activate_tab_family = manage_tab_family(
            id => this.webViews[id].activate()
        );
        let suspend_tab_family = manage_tab_family(
            id => this.webViews[id].suspend()
        );
        let deactivate_tab_family = manage_tab_family(
            id => this.webViews[id].deactivate()
        );
        
        console.log(`tab family id: ${tab_family_id}. this.queue: ${this.queue.toString()}`);
        
        activate_tab_family(tab_family_id);
        
        if (this.queue.length > this.maxActiveTabFamilies) {
            suspend_tab_family(this.queue[this.maxActiveTabFamilies]);
        }
        
        const maxNotDeactivated = this.maxActiveTabFamilies + this.maxSuspendedTabFamilies;
        
        if (this.queue.length > maxNotDeactivated) {
            deactivate_tab_family(this.queue.pop());
        }
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
}

export default RendererPerTabPolicy;
export {RendererPerTabPolicy};
