// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

const fs = require('fs');
const path = require('path');
const locales = [
	'af-ZA', 'am-ET', 'ar-AE', 'ar-BH', 'ar-DJ', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA',
	'ar-MR', 'ar-OM', 'ar-QA', 'ar-SA', 'ar-SD', 'ar-SY', 'ar-TN', 'ar-YE', 'as-IN', 'az-Latn-AZ', 'bg-BG', 'bn-IN',
	'bs-Latn-BA', 'bs-Latn-ME', 'cs-CZ', 'da-DK', 'de-AT', 'de-CH', 'de-DE', 'de-LU', 'el-CY', 'el-GR', 'en-AM', 'en-AU',
	'en-AZ', 'en-CA', 'en-CN', 'en-ET', 'en-GB', 'en-GE', 'en-GH', 'en-GM', 'en-HK', 'en-IE', 'en-IN', 'en-IS', 'en-JP',
	'en-KE', 'en-LK', 'en-LR', 'en-MM', 'en-MW', 'en-MX', 'en-MY', 'en-NG', 'en-NZ', 'en-PH', 'en-PK', 'en-PR', 'en-RW',
	'en-SD', 'en-SG', 'en-SL', 'en-TW', 'en-TZ', 'en-UG', 'en-US', 'en-ZA', 'en-ZM', 'es-AR', 'es-BO', 'es-CA', 'es-CL',
	'es-CO', 'es-CR', 'es-DO', 'es-EC', 'es-ES', 'es-GQ', 'es-GT', 'es-HN', 'es-MX', 'es-NI', 'es-PA', 'es-PE', 'es-PH',
	'es-PR', 'es-PY', 'es-SV', 'es-US', 'es-UY', 'es-VE', 'et-EE', 'fa-AF', 'fa-IR', 'fi-FI', 'fr-BE', 'fr-BF', 'fr-BJ',
	'fr-CA', 'fr-CD', 'fr-CF', 'fr-CG', 'fr-CH', 'fr-CI', 'fr-CM', 'fr-CQ', 'fr-DJ', 'fr-DZ', 'fr-FR', 'fr-GA', 'fr-GN',
	'fr-LB', 'fr-LU', 'fr-ML', 'fr-RW', 'fr-SN', 'fr-TG', 'ga-IE', 'gu-IN', 'ha-Latn-NG', 'he-IL', 'hi-IN', 'hr-HR', 'hr-ME',
	'hu-HU', 'id-ID', 'it-CH', 'it-IT', 'ja-JP', 'kk-Cyrl-KZ', 'km-KH', 'kn-IN', 'ko-KR', 'ku-Arab-IQ', 'lt-LT', 'lv-LV',
	'mk-MK', 'ml-IN', 'mn-Cyrl-MN', 'mr-IN', 'ms-MY', 'ms-SG', 'nb-NO', 'nl-BE', 'nl-NL', 'or-IN', 'pa-IN', 'pa-PK',
	'pl-PL', 'pt-AO', 'pt-BR', 'pt-CQ', 'pt-CV', 'pt-PT', 'ro-RO', 'ru-BY', 'ru-GE', 'ru-KG', 'ru-KZ', 'ru-RU', 'ru-UA',
	'si-LK', 'sk-SK', 'sl-SI', 'sq-AL', 'sq-ME', 'sr-Latn-RS', 'sr-Latn-ME', 'sv-FI', 'sv-SE', 'sw-Latn-KE', 'ta-IN',
	'te-IN', 'th-TH', 'tr-AM', 'tr-AZ', 'tr-CY', 'tr-TR', 'uk-UA', 'ur-IN', 'ur-PK', 'uz-Latn-UZ', 'uz-Cyrl-UZ', 'vi-VN',
	'zh-Hans-CN', 'zh-Hans-MY', 'zh-Hans-SG', 'zh-Hant-HK', 'zh-Hant-TW', 'ko'
];
const bundles = [
	'resources',
	'node_modules/@enact/moonstone/resources'
];
const defaultBundle = 'resources';
const outDir = process.argv[3] || 'localedata';

process.chdir(process.argv[2] || '.');

function getSpec(locale, bundle) {
	const loadParams = bundle!==defaultBundle ? {root: path.relative(process.cwd(), fs.realpathSync(bundle)).replace(/\.\.(\/)?/g, "_$1").replace(/\\/g, '/')} : undefined;
	return locale.replace(/[-/]/g, '_') + ',strings.json,' + String(hashCode(loadParams));
}

function addHash(hash, newValue) {
	// co-prime numbers creates a nicely distributed hash
	hash *= 65543;
	hash += newValue;
	hash %= 2147483647;
	return hash;
}

function stringHash(str) {
	let hash = 0;
	for(let i = 0; i < str.length; i++) {
		hash = addHash(hash, str.charCodeAt(i));
	}
	return hash;
}

function hashCode(obj) {
	let hash = 0;
	switch (typeof obj) {
		case 'undefined':
			hash = 0;
			break;
		case 'string':
			hash = stringHash(obj);
			break;
		case 'function':
		case 'number':
		case 'xml':
			hash = stringHash(String(obj));
			break;
		case 'boolean':
			hash = obj ? 1 : 0;
			break;
		case 'object': {
			const props = [];
			for(const p in obj) {
				if (obj.hasOwnProperty(p)) {
					props.push(p);
				}
			}
			// make sure the order of the properties doesn't matter
			props.sort();
			for (let i = 0; i < props.length; i++) {
				hash = addHash(hash, stringHash(props[i]));
				hash = addHash(hash, hashCode(obj[props[i]]));
			}
			break;
		}
	}

	return hash;
}

if(!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const prelude = 'window.resBundleData = window.resBundleData || {};\n';

locales.forEach(locale => {
	locale = locale.replace(/-/g, '/');
	const content = bundles.reduce((result, bundle) => {
		const spec = getSpec(locale, bundle);
		const files = ['strings.json'].concat(locale.split(/[-/]/).map((v, i, a) => a.slice(0, i+1).join('/') + '/strings.json'));
		const data = files.reduce((obj, file) => {
			const f = path.join(bundle, file);
			if(fs.existsSync(f)) {
				obj = Object.assign(obj, JSON.parse(fs.readFileSync(f, {encoding:'UTF8'})));
			}
			return obj;
		}, {});

		return result + 'window.resBundleData[\'' + spec + '\'] = ' + JSON.stringify(data) + ';\n';
	}, '');
	fs.writeFileSync(path.join(outDir, locale.replace(/\//g, '-') + '.js'), prelude + content, {encoding:'UTF8'});
});

