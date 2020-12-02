// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {RendererPerTabPolicy as SimplePolicy} from './RendererPerTabPolicy.js';
import {MemoryManagerTabPolicy} from './MemoryManagerTabPolicy.js';

function createTabPolicy (tabs, webViews, config) {
	if (window.navigator && window.navigator.memorymanager) {
		console.log('Create MemoryManagerTabPolicy'); // eslint-disable-line no-console
		return new MemoryManagerTabPolicy(
			tabs,
			webViews,
			config.memoryManager.maxSuspendedNormal,
			config.memoryManager.maxSuspendedLow,
			config.memoryManager.maxSuspendedCritical
		);
	} else {
		console.log('Create SimplePolicy'); // eslint-disable-line no-console
		return new SimplePolicy(
			tabs,
			webViews,
			config.simplePolicy.maxActiveTabFamilies,
			config.simplePolicy.maxSuspendedTabFamilies
		);
	}
}

export default createTabPolicy;
export {createTabPolicy};
