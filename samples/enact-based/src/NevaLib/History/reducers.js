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

/* reducers */

import {actionTypes as types} from './constants';

const
	initialHistoryState = {
		retrievedData: []
	};

function historyState (state = initialHistoryState, action) {
	switch (action.type) {
		case types.SET_RETRIEVED_HISTORY_DATA: {
			return Object.assign({}, state, {
				retrievedData: action.data
			});
		}
		case types.CLEAR_HISTORY: {
			const newData = state.retrievedData.filter((elem, id) => (
				!action.ids.includes(id)
			));
			return Object.assign({}, state, {
				retrievedData: newData
			});
		}
		default:
			return state;
	}
}

export default historyState;
