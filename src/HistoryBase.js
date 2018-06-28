/**
 entry stucture : {
    id :
    url :
    date :
    title :
 }
*/
class HistoryBase {
    constructor(store, storage) {
        this.store = store;
        this.storage = storage;
        //this.storage = new InMemoryHistory();
    }

    initialize() {
        console.info('HistoryBase::initialize() is not implemented');
    }

    // interface for Browser
    addEntry(url, title='') {
        return this.storage.add({
            url: url,
            title: title,
            date: new Date()
        });
    }

    // private
    updateEntryTitle(url, title) {
        this.storage.updateTitle(url, title);
    }

    // If empty params - all history
    retrieveByDate(from, to) {
        const store = this.store;
        this.storage.getEntriesByDate(
            from,
            to,
            (data) => {
                this.store.update(data.reverse());
            }
        );
    }

    //retrieves in reverse order of adding
    retrieveByPos(from, to) {
        const store = this.store;
        this.storage.getEntriesByPos(
            from,
            to,
            (data) => {
                this.store.update(data.reverse());
            }
        );
    }

    clearByIds(ids, oncomplete) {
        const obj = this;
        this.storage.clearByIds(ids, oncomplete);
    }

    clearAll() {
        this.storage.clearAll();
        this.store.update([]);
    }

}

export {HistoryBase};