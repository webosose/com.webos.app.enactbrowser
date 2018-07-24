// Copyright (c) 2018 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

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