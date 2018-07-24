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
