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

import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import componentCss from './BrowserIcon.less';

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
