// Copyright (c) 2018 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

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
