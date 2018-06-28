/* actions */

import {actionTypes as types} from './constants';

const setRetrievedHistoryData = (data) => ({
	type: types.SET_RETRIEVED_HISTORY_DATA,
	data
});

const clearHistory = (ids) => ({
	type: types.CLEAR_HISTORY,
	ids
});

export {
	setRetrievedHistoryData,
	clearHistory
};
