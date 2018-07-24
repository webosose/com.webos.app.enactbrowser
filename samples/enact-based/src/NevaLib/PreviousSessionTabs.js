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

import PreviousTabs from 'js-browser-lib/PreviousTabs';
import PreviousTabsIdbStorage from 'js-browser-lib/PreviousTabsIdbStorage';
import LastSelectedTab from 'js-browser-lib/LastSelectedTab';
import config from './Config.js';

class PreviousSessionTabs {
    constructor(browser, db, policy = config.restorePrevSessionPolicy) {
        this.browser = browser;
        this.policyImpl = null;
        switch (policy) {
            case 'onlyLastTab':
                this.policyImpl = new LastSelectedTab(
                    db, browser.tabs);
                break;
            case 'allTabs':
            default:
                this.policyImpl = new PreviousTabs(
                    new PreviousTabsIdbStorage(db), browser.tabs);
        }
    }

    restore() {
        const browser = this.browser;
        const policy = this.policyImpl;
        policy.get().then((tabs) => {
            if (tabs.length !== 0) {
                policy.reset().then(() => {
                    tabs.forEach((tab) => {
                        browser.createTab(tab.type, tab.url);
                    });
                });
            }
            else {
                browser.createTab();
            }
        })
    }
}

export default PreviousSessionTabs;
export {PreviousSessionTabs};