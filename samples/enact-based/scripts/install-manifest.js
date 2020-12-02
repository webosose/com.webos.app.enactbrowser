#!/usr/bin/env node

// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

'use strict';
try {
	const {
		from = 'manifest.json',
		to = 'dist/manifest.json',
		version_suffix = ''
	} = require('minimist')(process.argv.slice(2));

	const
		fs = require('fs'),
		json = JSON.parse(fs.readFileSync(from, 'utf8'));

	json.version_name = json.version + ' ' + version_suffix;

	fs.writeFileSync(to, JSON.stringify(json, null, 2), 'utf8');
} catch (err) {
	console.log(err); // eslint-disable-line no-console
	console.log('Failed to install manifest.json'); // eslint-disable-line no-console
	process.exit(1);
}
