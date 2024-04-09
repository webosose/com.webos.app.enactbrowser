// Copyright 2018 LG Electronics, Inc.
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

import $L from '@enact/i18n/$L';
import classNames from 'classnames';
import Button from '@enact/agate/Button';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import Popup from '@enact/agate/Popup';

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
						<Button onClick={onWait} size={"large"}>{$L('Wait')}</Button>
						<Button onClick={onStop} size={"large"}>{$L('Stop')}</Button>
					</buttons>;

		const dialog =
					<Popup
						noAutoDismiss
						open={show_error_dialog}
					>
						<p>{$L('The current page has become unresponsive. You can wait for it to become responsive.')}</p>
					{buttons}
					</Popup>;

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
