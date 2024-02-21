// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {RecentlyClosedSites}
    from './RecentlyClosedSites';
import {RecentlyClosedSitesIdbStorage}
    from './RecentlyClosedSitesIdbStorage';

import {setRecentlyClosed} from './ReduxComponents/Browser/actions';

class RecentlyClosed extends RecentlyClosedSites {
    constructor(reduxStore, db, tabs) {
        super(new RecentlyClosedSitesIdbStorage(db, 3), tabs);
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
