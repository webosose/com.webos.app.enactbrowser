// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import PreviousTabs from 'js-browser-lib/PreviousTabs';
import PreviousTabsIdbStorage from 'js-browser-lib/PreviousTabsIdbStorage';
import LastSelectedTab from 'js-browser-lib/LastSelectedTab';

class PreviousSessionTabs {
    constructor(browser, db, policy) {
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