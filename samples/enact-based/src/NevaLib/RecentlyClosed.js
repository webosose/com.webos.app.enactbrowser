import {RecentlyClosedSites}
    from 'js-browser-lib/RecentlyClosedSites';
import {RecentlyClosedSitesIdbStorage}
    from 'js-browser-lib/RecentlyClosedSitesIdbStorage';

import {setRecentlyClosed} from './Browser/actions';

class RecentlyClosed extends RecentlyClosedSites {
    constructor(reduxStore, db, tabs) {
        super(new RecentlyClosedSitesIdbStorage(db), tabs, 3);
        this.store = reduxStore;
    }

    retrieveAll() {
        const store = this.store;
        return this.getAll().then((result) => {
            store.dispatch(setRecentlyClosed(result));
        });
    }
}

export default RecentlyClosed;
export {RecentlyClosed};