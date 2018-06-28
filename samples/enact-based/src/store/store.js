import {createStore, combineReducers} from 'redux';
import {historyUIState, bookmarkUIState, approvedSitesUIState, blockedSitesUIState} from '../reducers';
import {
	browserState,
	tabsState,
	settingsState,
	historyState,
	bookmarksState
} from '../NevaLib/Browser/reducers'; // TBD: fix path to '../NevaLib'

const combinedReducers = combineReducers({
	browserState,
	tabsState,
	settingsState,
	historyState,
	bookmarksState,
	historyUIState,
	bookmarkUIState,
	approvedSitesUIState,
	blockedSitesUIState
});

export default function configureStore (initialState) {
	const store = createStore(
		combinedReducers,
		initialState
	);

	if (module.hot) {
		// Enable Webpack hot module replacement for reducers
		module.hot.accept('../reducers', () => {
			const nextRootReducer = require('../reducers').default;

			store.replaceReducer(nextRootReducer);
		});
	}

	return store;
}
