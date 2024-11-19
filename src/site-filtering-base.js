// Copyright 2019 LG Electronics, Inc.
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

const
	WHITE_LIST_MODE = 'whitelist',
	BLACK_LIST_MODE = 'blacklist',
	OFF = 'off',
	filteringOptions = [OFF, WHITE_LIST_MODE, BLACK_LIST_MODE];

class SiteFilteringBase {
	constructor(store, navigatorSiteFilter) {
		this.navigatorSiteFilter = navigatorSiteFilter;
		this.store = store;
	}

	getURLs() {
		this.navigatorSiteFilter.getURLs((value) => {
			this.store.updateUrlList(value);
		});
	}

	/*
	*  Off - 0       Approved Sites - 1      Blocked Sites -2
	* This value need to store in the DB and call initial browser launch
	*/
	setMode(value) {
		if (this.navigatorSiteFilter.setType(filteringOptions.indexOf(value))) {
			this.getURLs();
		}
	}

	/*
	* Add url
	* Allowed or blocked sites decide based on the site filter state
	*/
	addURL(url) {
		if (url && this.navigatorSiteFilter.addURL(url)) {
			this.getURLs();
		}
	}

	/*
	 * Add url
	 * Allowed or blocked sites decide based on the site filter state
	 */
	updateURL(oldURL, newURL) {
		if (newURL && this.navigatorSiteFilter.updateURL(oldURL, newURL)) {
			this.getURLs();
		}
	}

	/*
	 * Delete urls
	 * Allowed or blocked sites decide based on the site filter state
	 * Param isDeleteAll: if true, allow deleting all urls in both Approved
	 * and Blocked modes
	 */
	deleteURLs(urls, isDeleteAll = false) {
		if (urls) {
			this.navigatorSiteFilter.deleteURLs(urls, isDeleteAll, (status) => {
				if (status) {
					this.getURLs();
				}
			});
		}
	}

	/*
	 * Disable the filtering mode
	 * and delete all urls
	 */
	resetDefault() {
		this.navigatorSiteFilter.setType(filteringOptions.indexOf(OFF));
		this.deleteURLs([], true);
	}
}

export default SiteFilteringBase;
export {SiteFilteringBase};
