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