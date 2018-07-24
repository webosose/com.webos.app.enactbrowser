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

/**
 * Contains the declaration for the ErrorPage component.
 *
 */

import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import css from './ErrorPage.less';

const ErrorPage = kind({
	name: 'ErrorPage',

	propTypes: {
		errorMsg: PropTypes.string
	},

	styles: {
		css,
		className: 'errorPage'
	},

	render: ({errorMsg, ...rest}) => (
		<div {...rest}>
			<div className={css.errorIcon} />
			<div className={css.errorTitle}>{'Cannot open the page.'}</div>
			<div className={css.errorCode}>{errorMsg}</div>
		</div>
	)
});

export default ErrorPage;
