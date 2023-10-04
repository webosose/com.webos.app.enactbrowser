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
import Button from '@enact/moonstone/Button';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import Notification from '@enact/moonstone/Notification';
import React from 'react';

import css from './ErrorPage.module.less';

const ErrorPage = kind({
	name: 'ErrorPage',

	propTypes: {
		errorMsg: PropTypes.string,
		show_error_dialog: PropTypes.boolean,
		onWait: PropTypes.func,
		onStop: PropTypes.func
	},

	defaultProps: {
		show_error_dialog: true
	},

	styles: {
		css,
		className: 'errorPage'
	},

	render: ({errorMsg, onWait, onStop, show_error_dialog, ...rest}) => {
		const iconClass = classNames(css.errorIcon, errorMsg === 'RENDERER_CRASHED' ? css.crash : css.normal);

		const buttons =
					<buttons>
						<Button onClick={onWait}>{$L('Wait')}</Button>
						<Button onClick={onStop}>{$L('Stop')}</Button>
					</buttons>;

		const dialog =
					<Notification
						noAutoDismiss
						open={show_error_dialog}
					>
						<p>{$L('The current page has become unresponsive. You can wait for it to become responsive.')}</p>
					{buttons}
					</Notification>;

		const error_page =
					<div {...rest}>
						<div className={iconClass} />
						<div className={css.errorTitle}>{$L('This webpage is not available')}</div>
						<div className={css.errorCode}>{errorMsg}</div>
					</div>

		if (show_error_dialog) {
			return dialog;
		} else {
			return error_page;
		}
	}
});

export default ErrorPage;
