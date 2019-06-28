// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import IdbSetStorage from 'js-browser-lib/IdbSetStorage';
import {
	SiteFiltering as SiteFilteringBase,
	WhiteList,
	BlackList
} from 'js-browser-lib/SiteFiltering';

// asterisk is removed from list of characters to escape
// TODO: optimize for one regexp
const regExpForEscaping = /[-\/\\^$+?.()|[\]{}]/g;
const regExpForReplacingAsterisks = /[*]/g;
/**
	Converts string with asterisk wildcards to RegExp object
	Example:
		'*lenta.ru*' => /^.*lenta\.ru.*$/
*/
function asteriskStringToRegExp(str) {
	str = str.replace(regExpForEscaping, '\\$&');
	str = str.replace(regExpForReplacingAsterisks, '.*');
	return new RegExp('^' + str + '$');
}

const
	WHITE_LIST_IDB_NAME = 'white-list',
	BLACK_LIST_IDB_NAME = 'black-list',
	WHITE_LIST_MODE = 'whitelist',
	BLACK_LIST_MODE = 'blacklist',
	OFF = 'off';

const FILTER_CTORS = {
	[WHITE_LIST_MODE] : WhiteList,
	[BLACK_LIST_MODE] : BlackList
}

/**
	Draft version of SiteFiltering implementation for testing purposes
*/
class SiteFiltering {
	static MODE = {
		WHITE_LIST: WHITE_LIST_MODE,
		BLACK_LIST: BLACK_LIST_MODE,
		OFF: OFF
	};

	constructor(webviews, tabs, db) {
		this.controller = new SiteFilteringBase(webviews, tabs);
		this.filterStorages = {
			[WHITE_LIST_MODE] : new IdbSetStorage(WHITE_LIST_IDB_NAME, db),
			[BLACK_LIST_MODE] : new IdbSetStorage(BLACK_LIST_IDB_NAME, db)
		};
	}

	initialize(defaults = null) {
		const transactionPromises = [];
		if (defaults) {
			for (let [mode, values] of Object.entries(defaults)) {
				if (mode in this.filterStorages) {
					transactionPromises.push(
						this.filterStorages[mode].setValues(values)
					);
				}
			}
		}

		return Promise.all(transactionPromises);
	}

	setMode(mode) {
		if (mode in this.filterStorages) {
			return this.filterStorages[mode].getAll()
				.then((values) => {
					this.controller.setFilter(new FILTER_CTORS[mode]());
					this.controller.filter.patterns =
						values.map(asteriskStringToRegExp);
				});
		}

		if (mode !== OFF) {
			console.warn('SiteFiltering - unknown mode / filter name');
		}
		this.controller.setFilter(null);
		return Promise.resolve();
	}
}

export default SiteFiltering;
export {SiteFiltering};
