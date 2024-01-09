// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {HistoryBase} from 'js-browser-lib/HistoryBase';
import {HistoryIdbStorage} from 'js-browser-lib/HistoryIdbStorage';

import {
	setRetrievedHistoryData
} from './actions';

class HistoryReduxStore {
	constructor (reduxStore) {
		this.store = reduxStore;
	}

	update = (data) => {
		this.store.dispatch(setRetrievedHistoryData(data));
	}
}

class History extends HistoryBase {
	constructor (reduxStore, indexedDb) {
		super(new HistoryReduxStore(reduxStore), new HistoryIdbStorage(indexedDb));
	}
}

export default History;
