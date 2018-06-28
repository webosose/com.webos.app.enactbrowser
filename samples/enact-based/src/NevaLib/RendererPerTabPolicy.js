import config from './Config.js';
import {TabTypes} from 'js-browser-lib/TabsConsts';

class RendererPerTabPolicy {
    constructor(tabs, webViews) {
        this.webViews = webViews;
        this.queue = [];
        this.maxActive = config.rendererPerTab.maxActiveTabs;
        this.maxSuspended = config.rendererPerTab.maxSuspendedTabs;
        this.maxNotDeactivated = this.maxActive + this.maxSuspended;
        tabs.addEventListener('select', this._handleTabSelect);
        tabs.addEventListener('delete', this._handleTabDelete);
    }

    _handleTabSelect = (ev) => {
        const tab = ev.state;
        if (tab.type !== TabTypes.WEBVIEW) {
            return;
        }

        const id = tab.id;
        const oldIndex = this.queue.findIndex((element) => (id === element));

        this.webViews[id].activate();
        if (oldIndex === -1) { // deactivated tab
            this.queue.unshift(id);
        }
        else { // in queue, then bring to top
            this.queue.splice(0, 0, this.queue.splice(oldIndex, 1)[0]);
        }
        if (this.queue.length > this.maxActive) {
            this.webViews[this.queue[this.maxActive]].suspend();
        }
        if (this.queue.length > this.maxNotDeactivated) {
            this.webViews[this.queue[this.maxNotDeactivated]].deactivate();
            this.queue.pop();
        }
    }

    _handleTabDelete = (ev) => {
        const tab = ev.state;
        if (tab.type !== TabTypes.WEBVIEW) {
            return;
        }

        const id = tab.id;
        const oldIndex = this.queue.findIndex((element) => (id === element));
        if (oldIndex !== -1) {
            this.queue.splice(oldIndex, 1);
        }
    }
}

export default RendererPerTabPolicy;
export {RendererPerTabPolicy};