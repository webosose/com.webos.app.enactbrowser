// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {
	SiteFiltering as SiteFilteringBase,
	WhiteList,
	BlackList
} from 'js-browser-lib/SiteFiltering';

/**
	Draft version of SiteFiltering implementation for testing purposes
*/
class SiteFiltering {
	constructor(webviews, tabs) {
		this.controller = new SiteFilteringBase(webviews, tabs);
		const
			whitelist = new WhiteList(),
			blacklist = new BlackList();
		whitelist.patterns.push(/^.*google.*$/);
		whitelist.patterns.push(/^.*yandex.*$/);
		blacklist.patterns.push(/^.*youtube.*$/);
		blacklist.patterns.push(/^.*lenta\.ru.*$/);
		this.filters = { whitelist, blacklist, off: null };
	}

	setMode(mode) {
		if (mode in this.filters) {
			this.controller.setFilter(this.filters[mode]);
		}
		else {
			console.warn('SiteFiltering - unknown mode / filter name');
			this.controller.setFilter(null);
		}
	}
}

export default SiteFiltering;
export {SiteFiltering};
