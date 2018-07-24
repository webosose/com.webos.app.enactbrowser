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

import {HistoryBase} from 'js-browser-lib/HistoryBase';
import {HistoryIdbStorage} from 'js-browser-lib/HistoryIdbStorage';

import {
    setRetrievedHistoryData,
} from './actions';

class HistoryReduxStore {
    constructor(reduxStore) {
        this.store = reduxStore;
    }

    update = (data) => {
        this.store.dispatch(setRetrievedHistoryData(data));
    }
}

class History extends HistoryBase {
    constructor(reduxStore, indexedDb) {
        super(new HistoryReduxStore(reduxStore), new HistoryIdbStorage(indexedDb));
    }
}

export default History;