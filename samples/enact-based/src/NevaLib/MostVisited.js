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

import {MostVisitedSites}
    from 'js-browser-lib/MostVisitedSites';
import {MostVisitedSitesIdbStorage}
    from 'js-browser-lib/MostVisitedSitesIdbStorage';
import {ThumbnailsIdbStorage}
    from 'js-browser-lib/ThumbnailsIdbStorage';
import {removeMostVisitedSite, setMostVisitedSites, setUrlSuggestions} from './Browser/actions';

class MostVisited extends MostVisitedSites {
    constructor(reduxStore, db, tabs, webviews) {
        super(
            new MostVisitedSitesIdbStorage(db),
            tabs,
            new ThumbnailsIdbStorage(db),
            webviews);
        this.store = reduxStore;
    }

    getSuggestions(pattern, number) {
        const store = this.store;
        return super.getSuggestions(pattern, number).then((result) => {
            store.dispatch(setUrlSuggestions(result));
        });
    }

    retrieve(number) {
        const store = this.store;
        return this.get(number).then((result) => {
            store.dispatch(setMostVisitedSites(result));
        });
    }

    retrieveWithThumbnails(number) {
        const store = this.store;
        return this.get(number).then((result) => {
            const requests = [];
            for (let i = 0; i < result.length; ++i) {
                requests.push(this.thumbnails.get(result[i].url));
            }
            return Promise.all(requests).then((thumbnails) => {
                for (let i = 0; i < requests.length; ++i) {
                    result[i].thumbnail =
                        thumbnails[i] ? thumbnails[i].thumbnail : undefined;
                }
                store.dispatch(setMostVisitedSites(result));
            });
        });

    }

    remove(url) {
        const store = this.store;
        return super.remove(url).then((result) => {
            store.dispatch(removeMostVisitedSite(url));
            return result;
        });
    }
}

export default MostVisited;
export {MostVisited};