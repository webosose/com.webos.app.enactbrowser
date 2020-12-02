#!/usr/bin/env node

// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

'use strict';

const path = require('path');
const fs = require('fs');

const dir = process.argv[2] || process.cwd();
const localizeRegex = /^index\.?(.*)\.html$/;
const startup = path.join(dir, 'startup');
const startupJS = path.join(startup, 'startup.js');


if (!fs.existsSync(startup)) fs.mkdirSync(startup);

fs.readdirSync(dir).forEach(f => {
	const match = f.match(localizeRegex);
	if (match) {
		const file = path.join(dir, f);
		let first = true;
		let html = fs.readFileSync(file, {encoding: 'UTF8'});
		match[1] = match[1] || 'update';
		html = html.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/g, function (m, openTag, innerScript, closeTag) {
			if (innerScript.trim().length > 0) {
				let out = path.join(startup, match[1] + '.js');
				if (first) {
					out = startupJS;
					first = false;
				}
				if (!fs.existsSync(out)) fs.writeFileSync(out, innerScript, {encoding: 'UTF8'});
				openTag = openTag.replace(/\s*>$/, '') + ' src="' + path.relative(dir, out).replace(/[\\/]+/g, '/') + '">';
				return openTag + closeTag;
			} else {
				return m;
			}
		});
		fs.writeFileSync(file, html, {encoding: 'UTF8'});
	}
});
