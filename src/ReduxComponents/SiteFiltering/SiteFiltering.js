// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import SiteFilteringBase from '../../SiteFilteringBase';
import {setSiteFilterList} from './actions';

class ReduxSiteFilteringStore {
    constructor(reduxStore) {
        this.store = reduxStore;
    }

    updateUrlList = (urls) => {
		this.store.dispatch(setSiteFilterList(urls));
	}
}

class SiteFiltering extends SiteFilteringBase {
	constructor(store, navigatorSiteFilter) {
        super(
            new ReduxSiteFilteringStore(store),
            navigatorSiteFilter
        );
	}
}

export default SiteFiltering;
export {SiteFiltering};
