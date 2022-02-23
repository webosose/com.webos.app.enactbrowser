// Copyright (c) 2019-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {
	SiteFiltering as SiteFilteringBase
} from 'js-browser-lib/SiteFiltering';
import { setSiteFilterList } from './actions';

const filteringOptions = ['off', 'whitelist', 'blacklist'];
const
	WHITE_LIST_MODE = 'whitelist',
	BLACK_LIST_MODE = 'blacklist',
	OFF = 'off';

/**
	Draft version of SiteFiltering implementation for testing purposes
*/
class SiteFiltering {
	static MODE = {
		WHITE_LIST: WHITE_LIST_MODE,
		BLACK_LIST: BLACK_LIST_MODE,
		OFF: OFF
	};

	constructor(reduxStore, navigatorSiteFilter) {
		this.controller = new SiteFilteringBase(navigatorSiteFilter);
		this.reduxStore = reduxStore;
	}

	initialize() {
		const transactionPromises = [];
		return Promise.all(transactionPromises);
	}
	updateUrlList = (urlList) => {
		this.reduxStore.dispatch(setSiteFilterList(urlList));
	}
	addUrl(url) {
		this.controller.addURL(url, this.updateUrlList)
	}
	updateURL(oldURL, newURL) {
		this.controller.updateURL(oldURL, newURL, this.updateUrlList);
	}
	deletURLs(urls) {
		this.controller.deletURLs(urls, this.updateUrlList)
	}
	setMode(mode) {
		this.controller.setState(filteringOptions.indexOf(mode), this.updateUrlList);
		return Promise.resolve();
	}
}

export default SiteFiltering;
export { SiteFiltering };
