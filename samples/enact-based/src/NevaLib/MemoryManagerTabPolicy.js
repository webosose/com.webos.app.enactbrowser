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

/*global window*/
import {RendererPerTabPolicy as SimplePolicy} from './RendererPerTabPolicy.js';

const maxActive = 1;

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
            maxActive,
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
                        resolve(ev.currentLevel);
                    });
                }),
                new Promise((resolve) => {
                    window.navigator.memorymanager.onlevelchanged = (ev) => {
                        resolve(ev.current);
                    };
                })
            ]).then((memoryStatus) => {
                console.log('Initializing memory status: ' + memoryStatus);
                policy.simplePolicy.maxSuspended =
                    policy.statusToMaxSuspended(memoryStatus);
                window.navigator.memorymanager.onlevelchanged =
                    policy._handleLevelChanged;
            });
        }
        else {
            console.error('MemoryManager interface is not implemented! \
                Check your WebOS version!');
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

    /*
        ev = {
            previous: '[normal|low|critical]',
            current: '[normal|low|critical]'
        }
    */
    _handleLevelChanged = (ev) => {
        console.log('Handle memory level change ' + ev.current);
        const policy = this.simplePolicy;
        policy.maxSuspended = this.statusToMaxSuspended(ev.current);
        while (policy.queue.length > policy.maxSuspended + policy.maxActive) {
            const id = policy.queue.pop();
            policy.webViews[id].deactivate();
        }
        console.log('_handleLevelChanged');
        console.log(policy);
    }
}

export default MemoryManagerTabPolicy;
export {MemoryManagerTabPolicy};