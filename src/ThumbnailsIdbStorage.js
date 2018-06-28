const STORE_NAME = 'site-thumbnails';

class ThumbnailsIdbStorage {
    constructor(db) {
        this.db = db;
        this.db.addObjectStore(STORE_NAME, {keyPath: 'url'});
    }

    add(entry) {
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('add', [entry])
        );
    }

    exists(url) {
        return this.db.transaction('readonly', STORE_NAME, (store) =>
            store.request('count', [IDBKeyRange.only(url)])).then((result) => {
                return !!result;
            });
    }

    get(url) {
        return this.db.transaction('readonly', STORE_NAME, (store) =>
            store.request('get', [url]));
    }

    getAll() {
        return this.db.transaction('readonly', STORE_NAME, (store) =>
            store.request('getAll', []));
    }

    remove(url) {
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('delete', [url]));
    }

    removeAll() {
        return this.db.transaction('readwrite', STORE_NAME, (store) =>
            store.request('clear', []));
    }
}

export default ThumbnailsIdbStorage;
export {ThumbnailsIdbStorage};