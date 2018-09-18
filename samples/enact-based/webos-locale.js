// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

(function() {
	var localeBundles = [
		'ilibdata/' + navigator.language + '.js',
		'localedata/' + navigator.language + '.js'
	];
	for(var i=0; i<localeBundles.length; i++) {
		var script= document.createElement('script');
		script.type = 'text/javascript';
		script.src = localeBundles[i];
		script.async = false;
		document.head.appendChild(script);
	}
})();
