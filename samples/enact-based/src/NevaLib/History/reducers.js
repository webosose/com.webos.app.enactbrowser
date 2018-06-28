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
