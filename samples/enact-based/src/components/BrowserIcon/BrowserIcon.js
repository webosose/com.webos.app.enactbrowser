// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import componentCss from './BrowserIcon.module.less';

const BrowserIcon = kind({
	name: 'BrowserIcon',

	propTypes: {
		css: PropTypes.object,
		pressed: PropTypes.bool,
		small: PropTypes.bool
	},

	defaultProps: {
		pressed: false,
		small: false
	},

	styles: {
		css: componentCss,
		className: 'browserIcon',
		publicClassNames: true
	},

	computed: {
		className: ({pressed, small, styler}) => styler.append({
			pressed,
			small
		})
	},

	render: (props) => {
		delete props.pressed;
		delete props.small;

		return (
			<div
				aria-hidden
				{...props}
			/>
		);
	}
});

export default BrowserIcon;
export {
	BrowserIcon
};
