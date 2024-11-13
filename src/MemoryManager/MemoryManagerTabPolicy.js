// Copyright 2018 LG Electronics, Inc.
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

// FIXME(neva): Commented to fix build issue on RP build #2250
//global window

import {RendererPerTabPolicy as SimplePolicy} from './RendererPerTabPolicy.js';

const maxActiveTabFamilies = 1;

class MemoryManagerTabPolicy {
    constructor(
            tabs,
            webViews,
            maxSuspendedNormal,
            maxSuspendedLow,
            maxSuspendedCritical
        ) {
        this.simplePolicy = new SimplePolicy(
            tabs,
            webViews,
            maxActiveTabFamilies,
            maxSuspendedCritical
        );
        this.maxSuspendedNormal = maxSuspendedNormal;
        this.maxSuspendedLow = maxSuspendedLow;
        this.maxSuspendedCritical = maxSuspendedCritical;

        const policy = this;
        if (window.navigator && window.navigator.memorymanager) {
            Promise.race([
                new Promise((resolve) => {
                    window.navigator.memorymanager.getMemoryStatus((ev) => {
                        resolve(ev);
                    });
                }),
                new Promise((resolve) => {
                    window.navigator.memorymanager.onlevelchanged = (ev) => {
                        resolve(ev);
                    };
                })
            ]).then((memoryStatus) => {
                console.log('Initializing memory status: ' + memoryStatus);
                policy.simplePolicy.maxSuspendedTabFamilies =
                    policy.statusToMaxSuspended(memoryStatus);
                window.navigator.memorymanager.onlevelchanged =
                    policy._handleLevelChanged;
            });
        }
        else {
            console.error(`MemoryManager interface is not implemented! \
                Check your WebOS version!`);
        }
    }

    statusToMaxSuspended(memoryStatus) {
        switch (memoryStatus) {
            case 'normal':
                return this.maxSuspendedNormal;
            case 'low':
                return this.maxSuspendedLow;
            case 'critical':
                return this.maxSuspendedCritical;
            default:
                console.error('Unknown memory status recieved from memory manager!');
                return 0;
        }
    }

    /* jshint ignore:start */
    /*
        ev = {
            previous: '[normal|low|critical]',
            current: '[normal|low|critical]'
        }
    */
    _handleLevelChanged = (ev) => {
        window.QALog('Handle memory level change ' + ev);
        const policy = this.simplePolicy;
        policy.maxSuspendedTabFamilies = this.statusToMaxSuspended(ev);
        while (policy.queue.length > policy.maxSuspendedTabFamilies + policy.maxActiveTabFamilies) {
            const id = policy.queue.pop();
            policy.deactivateTabFamily(id);
        }
        console.log('_handleLevelChanged');
        console.log(policy);
    }
    /* jshint ignore:end */
}

export default MemoryManagerTabPolicy;
export {MemoryManagerTabPolicy};
