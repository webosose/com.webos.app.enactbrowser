// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {RendererPerTabPolicy as SimplePolicy} from './RendererPerTabPolicy.js';
import {MemoryManagerTabPolicy} from './MemoryManagerTabPolicy.js';

function createTabPolicy(tabs, webViews, config) {
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
            config.simplePolicy.maxActiveTabs,
            config.simplePolicy.maxSuspendedTabs
        );
    }
}

export default createTabPolicy;
export {createTabPolicy};
