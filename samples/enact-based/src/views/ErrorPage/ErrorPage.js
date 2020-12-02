// Copyright (c) 2018-2020 LG Electronics, Inc.
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

import $L from '@enact/i18n/$L';
import classNames from 'classnames';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import css from './ErrorPage.module.less';

const ErrorPage = kind({
	name: 'ErrorPage',

	propTypes: {
		errorMsg: PropTypes.string
	},

	styles: {
		css,
		className: 'errorPage'
	},

	render: ({errorMsg, ...rest}) => {
		const iconClass = classNames(css.errorIcon, errorMsg === 'RENDERER_CRASHED' ? css.crash : css.normal);
		return (
			<div {...rest}>
				<div className={iconClass} />
				<div className={css.errorTitle}>{$L('This webpage is not available')}</div>
				<div className={css.errorCode}>{errorMsg}</div>
			</div>
		);
	}
});

export default ErrorPage;
