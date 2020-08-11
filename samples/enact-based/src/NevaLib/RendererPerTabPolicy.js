// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {TabTypes} from 'js-browser-lib/TabsConsts';

class RendererPerTabPolicy {
    constructor(tabs, webViews, maxActive, maxSuspended) {
        this.webViews = webViews;
        this.queue = [];
        this.maxActive = maxActive;
        this.maxSuspended = maxSuspended;
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

        const id = tab.id;
        const oldIndex = this.queue.findIndex((element) => (id === element));

        this.webViews[id].activate();
        if (oldIndex === -1) { // deactivated tab
            this.queue.unshift(id);
        }
        else { // in queue, then bring to top
            this.queue.splice(0, 0, this.queue.splice(oldIndex, 1)[0]);
        }
        if (this.queue.length > this.maxActive) {
            this.webViews[this.queue[this.maxActive]].suspend();
        }
        const maxNotDeactivated = this.maxActive + this.maxSuspended;
        if (this.queue.length > maxNotDeactivated) {
            const lastId = this.queue.pop();
            this.webViews[lastId].deactivate();
        }
    }

    _handleTabDelete = (ev) => {
        const tab = ev.state;
        if (tab.type !== TabTypes.WEBVIEW) {
            return;
        }

        const id = tab.id;
        const oldIndex = this.queue.findIndex((element) => (id === element));
        if (oldIndex !== -1) {
            this.queue.splice(oldIndex, 1);
        }
    }
}

export default RendererPerTabPolicy;
export {RendererPerTabPolicy};
