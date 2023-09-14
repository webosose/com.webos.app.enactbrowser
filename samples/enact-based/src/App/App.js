// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import kind from '@enact/core/kind';
import AppDecorator from '../components/AppDecorator';
import ThemeDecorator from '@enact/agate/ThemeDecorator';

import Main from '../views/Main';

import css from './App.module.less';

const App = kind({
	name: 'App',

	styles: {
		css,
		className: 'app'
	},

	render: (props) => (
		<Main {...props} />
	)
});

export default AppDecorator(ThemeDecorator({i18n: false}, App));
