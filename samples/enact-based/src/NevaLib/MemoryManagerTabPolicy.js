// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import { RendererPerTabPolicy as SimplePolicy } from './RendererPerTabPolicy.js';

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
			maxSuspendedCritical,
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
				console.log('Initializing memory status: ' + memoryStatus); // eslint-disable-line no-console
				policy.simplePolicy.maxSuspendedTabFamilies =
					policy.statusToMaxSuspended(memoryStatus);
				window.navigator.memorymanager.onlevelchanged =
					policy._handleLevelChanged;
			});
		} else {
			console.error('MemoryManager interface is not implemented! Check your WebOS version!'); // eslint-disable-line no-console
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
				console.error('Unknown memory status recieved from memory manager!'); // eslint-disable-line no-console
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
		console.log('Memory level changed to ==>' + ev); // eslint-disable-line no-console
		const policy = this.simplePolicy;
		if (ev == "critical") {
			policy.criticalReached = true;
			policy._handleCriticalMemory();
		} else {
			policy.criticalReached = false
		}
	};
}

export default MemoryManagerTabPolicy;
export { MemoryManagerTabPolicy };
