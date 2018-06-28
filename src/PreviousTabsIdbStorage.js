import {IdbOrderedStorage} from './IdbOrderedStorage.js';

const STORE_NAME = 'prev-tabs';

/**
Tab info structure:
{
    id,
    type,
    url,
    pos (will be present when returning from getInfo)
}
*/
class PreviousTabsIdbStorage {
    constructor(db) {
        this.storage = new IdbOrderedStorage(db, STORE_NAME, 'id');
    }

    get() {
        return this.storage.getAll();
    }

    reset() {
        //TODO: reset with array of new infos
        return this.storage.removeAll();
    }

    getAndReset() {
        const storage = this.storage;
        return storage.getAll().then((tabsInfo) => {
            return storage.removeAll().then(() => tabsInfo);
        });
    }

    add(tabInfo) {
        return this.storage.add(tabInfo);
    }

    update(tabInfo) {
        return this.storage.set(tabInfo);
    }

    remove(id) {
        return this.storage.remove([id]);
    }

    insert(pos, tabInfo) {
        return this.storage.insert(pos, tabInfo);
    }

    move(from, to) {
        return this.storage.move(from, to);
    }

    replace(pos, newInfo) {
        return this.storage.db.transaction('readwrite', STORE_NAME, (store) => {
            return store.request('get', [pos], 'pos').then((result) => {
                return store.request('delete', [result[1].id]);
            }).then(() => {
                return store.request('add', [{pos, ...newInfo}]);
            })
        });
    }
}

export default PreviousTabsIdbStorage;
export {PreviousTabsIdbStorage};
