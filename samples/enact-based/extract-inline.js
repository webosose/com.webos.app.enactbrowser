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

#!/usr/bin/env node

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
		html = html.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/g, function(m, openTag, innerScript, closeTag) {
			if (innerScript.trim().length > 0 && (first || match[1])) {
				let out = path.join(startup, match[1] + '.js');
				if (first) {
					out = startupJS;
					first = false;
				}
				if(!fs.existsSync(out)) fs.writeFileSync(out, innerScript, {encoding: 'UTF8'});
				openTag = openTag.replace(/\s*>$/, '') + ' src="' + path.relative(dir, out).replace(/[\\/]+/g, '/') + '">';
				return openTag + closeTag;
			} else {
				return m;
			}
		});
		fs.writeFileSync(file, html, {encoding: 'UTF8'});
	}
});
