import config from './Config.js';
import {RendererPerTabPolicy as SimplePolicy} from './RendererPerTabPolicy.js';
import {MemoryManagerTabPolicy} from './MemoryManagerTabPolicy.js';

function createTabPolicy(tabs, webViews) {
    if (window.navigator && window.navigator.memorymanager) {
        console.log('Create MemoryManagerTabPolicy');
        return new MemoryManagerTabPolicy(
            tabs,
            webViews,
            config.memoryManager.maxSuspendedNormal,
            config.memoryManager.maxSuspendedLow,
            config.memoryManager.maxSuspendedCritical
        );
    }
    else {
        console.log('Create SimplePolicy');
        return new SimplePolicy(
            tabs,
            webViews,
            config.rendererPerTab.maxActiveTabs,
            config.rendererPerTab.maxSuspendedTabs
        );
    }
}

export default createTabPolicy;
export {createTabPolicy};
