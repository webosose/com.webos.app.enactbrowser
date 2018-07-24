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