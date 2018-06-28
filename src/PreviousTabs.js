
class PreviousTabs {
    constructor(storage, tabs) {
        this.storage = storage;
        tabs.addEventListener('add', this.handleTabAdd);
        tabs.addEventListener('update', this.handleTabUpdate);
        tabs.addEventListener('delete', this.handleTabDelete);
        tabs.addEventListener('move', this.handleTabMove);
        tabs.addEventListener('replace', this.handleTabReplace);
    }

    get() {
        return this.storage.get();
    }

    reset() {
        return this.storage.reset();
    }

    handleTabAdd = (ev) => {
        this.storage.add(this._createTabInfo(ev.tab));
    }

    handleTabUpdate = (ev) => {
        if (ev.diff.navState && ev.diff.navState.url) {
            const state = ev.state;
            this.storage.update({
                id: state.id,
                type: state.type,
                url: state.navState.url
            })
        }
    }

    handleTabDelete = (ev) => {
        this.storage.remove(ev.tab.id);
    }

    handleTabMove = (ev) => {
        this.storage.move(ev.from, ev.to);
    }

    handleTabReplace = (ev) => {
        this.storage.replace(ev.index, this._createTabInfo(ev.state));
    }

    _createTabInfo = (tab) => ({
        id: tab.id,
        type: tab.type,
        url: tab.navState.url
    })
}

export default PreviousTabs;
export {PreviousTabs};