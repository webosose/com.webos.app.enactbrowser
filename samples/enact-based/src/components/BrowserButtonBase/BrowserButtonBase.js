// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {ButtonBase} from '@enact/moonstone/Button';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import componentCss from './BrowserButtonBase.less';

const BrowserButtonBase = kind({
	name: 'BrowserButtonBase',

	propTypes: {
		withBg: PropTypes.bool
	},

	defaultProps: {
		withBg: false
	},

	styles: {
		css: componentCss,
		className: 'browserButtonBase'
	},

	computed: {
		className: ({withBg, styler}) => styler.append({withBg})
	},

	render: ({css, ...rest}) => {
		delete rest.withBg;

		return (
			<ButtonBase
				css={css}
				{...rest}
			/>
		);
	}
});

export default BrowserButtonBase;
export {
	BrowserButtonBase
};
