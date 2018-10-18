// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

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
