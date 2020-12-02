// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE
(function () {
	let localeBundles = [
		'ilib/' + navigator.language + '.js',
		'localedata/' + navigator.language + '.js'
	];
	for (let i = 0; i < localeBundles.length; i++) {
		let script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = localeBundles[i];
		script.async = false;
		document.head.appendChild(script);
	}
})();
