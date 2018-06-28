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