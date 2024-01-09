// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* global chrome*/

class PromissifiedChromeLocalStorage {
	constructor () {
	}

	get (items) {
		return new Promise((resolve, reject) => {
			if (items instanceof Object) {
				chrome.storage.local.get(items, (newItems) => {
					if (chrome.runtime.lastError) {
						reject(chrome.runtime.lastError);
					} else {
						resolve(newItems);
					}
				});
			} else {
				reject('get(items) - items should be an Object');
			}
		});
	}

	set (items) {
		return new Promise((resolve, reject) => {
			if (items instanceof Object) {
				chrome.storage.local.set(items, () => {
					if (chrome.runtime.lastError) {
						reject(chrome.runtime.lastError);
					} else {
						resolve();
					}
				});
			} else {
				reject('set(items) - items should be an Object');
			}
		});
	}
}

const isPositiveNumber = (value) => {
	return (
		('number' === typeof value) &&
        (0 <= value)
	);
};

const isZero = (value) => (value === 0);

class SimplePolicy {
	constructor (storage) {
		this._storage = storage;
		this._maxActiveTabFamilies = 1;
		this._maxSuspendedTabFamilies = 2;
	}

	get maxActiveTabFamilies () {
		return this._maxActiveTabFamilies;
	}

	setMaxActiveFamilies (newValue) {
		if (!isPositiveNumber(newValue)) {
			return Promise.reject('Should be a positive number');
		}
		if (isZero(newValue)) {
			return Promise.reject('Can\'t be a zero');
		}
		return this._storage.set({spMaxActiveTabFamilies: newValue})
			.then(() => {
				this._maxActiveTabFamilies = newValue;
			});
	}

	get maxSuspendedTabFamilies () {
		return this._maxSuspendedTabFamilies;
	}

	setMaxSuspendedFamilies (newValue) {
		if (!isPositiveNumber(newValue)) {
			return Promise.reject('Should be a positive number');
		}
		return this._storage.set({spMaxSuspendedTabFamilies: newValue})
			.then(() => {
				this._maxSuspendedTabFamilies = newValue;
			});
	}
}

class MemoryManager {
	constructor (storage) {
		this._storage = storage;
		this._maxSuspendedNormal = 3;
		this._maxSuspendedLow = 1;
		this._maxSuspendedCritical = 0;
	}

	get maxSuspendedNormal () {
		return this._maxSuspendedNormal;
	}

	get maxSuspendedLow () {
		return this._maxSuspendedLow;
	}

	get maxSuspendedCritical () {
		return this._maxSuspendedCritical;
	}

	setSuspendedNumbers (normal, low, critical) {
		if (!isPositiveNumber(normal)) {
			return Promise.reject('maxSuspendedNormal should be positive number');
		}
		if (!isPositiveNumber(low)) {
			return Promise.reject('maxSuspendedLow should be positive number');
		}
		if (!isPositiveNumber(critical)) {
			return Promise.reject('maxSuspendedCritical should be positive number');
		}
		if (normal < low || low < critical) {
			return Promise.reject(
				`maxSuspendedNormal shouldn\'t be less than maxSuspendedLow and
                maxSuspendedLow shouldn\'t be less than maxSuspendedCritical`
			);
		}
		return this._storage.set({
			mmMaxSuspendedNormal: normal,
			mmMaxSuspendedLow: low,
			mmMaxSuspendedCritical: critical
		}).then(() => {
			this._maxSuspendedNormal = normal;
			this._maxSuspendedLow = low;
			this._maxSuspendedCritical = critical;
		});
	}
}

// Config data, which is stored in memory for instant data access
// and in IndexedDb for keeping data between sessions.
class Config {
	constructor () {
		this._storage = new PromissifiedChromeLocalStorage();
		this._useBuiltInErrorPages = true;
		this._restorePrevSessionPolicy =
        this.simplePolicy = new SimplePolicy(this._storage);
		this.memoryManager = new MemoryManager(this._storage);

	}

	initialize (defaults) {
		const setInMemoryValues = (values) => {
			this._useBuiltInErrorPages = values.useBuiltInErrorPages;
			this._restorePrevSessionPolicy = values.restorePrevSessionPolicy;
			this.simplePolicy._maxActiveTabFamilies = values.spMaxActiveTabFamilies;
			this.simplePolicy._maxSuspendedTabFamilies = values.spMaxSuspendedTabFamilies;
			this.memoryManager._maxSuspendedNormal = values.mmMaxSuspendedNormal;
			this.memoryManager._maxSuspendedLow = values.mmMaxSuspendedLow;
			this.memoryManager._maxSuspendedCritical = values.mmMaxSuspendedCritical;
		};

		return this._storage.get({
			useBuiltInErrorPages: defaults.useBuiltInErrorPages,
			restorePrevSessionPolicy: defaults.restorePrevSessionPolicy,
			spMaxActiveTabFamilies: defaults.simplePolicy.maxActiveTabFamilies,
			spMaxSuspendedTabFamilies: defaults.simplePolicy.maxSuspendedTabFamilies,
			mmMaxSuspendedNormal: defaults.memoryManager.maxSuspendedNormal,
			mmMaxSuspendedLow: defaults.memoryManager.maxSuspendedLow,
			mmMaxSuspendedCritical: defaults.memoryManager.maxSuspendedCritical
		})
			.then(setInMemoryValues);
	}

	get useBuiltInErrorPages () {
		return this._useBuiltInErrorPages;
	}

	setUseBuiltInErrorPages (newValue) {
		if ('boolean' !== typeof newValue) {
			return Promise.reject('Should be boolean');
		}
		return this._storage.set({useBuiltInErrorPages: newValue})
			.then(() => {
				this._useBuiltInErrorPages = newValue;
			});
	}

	get restorePrevSessionPolicy () {
		return this._restorePrevSessionPolicy;
	}

	setRestorePrevSessionPolicy (newValue) {
		if ('onlyLastTab' !== newValue && 'allTabs' !== newValue) {
			return Promise.reject(`Should be "onlyLastTab" or "allTabs" but was ${newValue}`);
		}
		return this._storage.set({restorePrevSessionPolicy: newValue})
			.then(() => {
				this._restorePrevSessionPolicy = newValue;
			});
	}

	get versionString () {
		return chrome.runtime.getManifest().version_name;
	}
}

export default Config;
export {Config};
