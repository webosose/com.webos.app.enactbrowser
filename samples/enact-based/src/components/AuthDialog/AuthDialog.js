// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the AuthDialog component.
 *
 */

import $L from '@enact/i18n/$L';
import Button from '@enact/moonstone/Button';
import Input from '@enact/moonstone/Input';
import Notification from '@enact/moonstone/Notification';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import css from './AuthDialog.less';

class AuthDialog extends Component {
	static props = {
		controller: PropTypes.object
	}

	constructor (props) {
		super(props);
		this.state = {
			username: '',
			password: ''
		};
	}

	onSignIn = (controller) => () => {
		controller.signIn(
			this.state.username,
			this.state.password
		);
	}

	onDialogCancel = (controller) => () => {
		controller.cancel();
	}

	onChangeUsername = (ev) => {
		this.setState({username: ev.value});
	}

	onChangePassword = (ev) => {
		this.setState({password: ev.value});
	}

	render () {
		const
			{controller} = this.props,
			{username, password} = this.state;

		return (
			<Notification
				noAutoDismiss
				open
				onClose={this.onDialogCancel(controller)}
				showCloseButton
			>
				<p>Username</p>
				<Input
					className={css.input}
					onChange={this.onChangeUsername}
					value={username}
				/>
				<p>Password</p>
				<Input
					className={css.input}
					onChange={this.onChangePassword}
					value={password}
					type='password'
				/>
				<buttons>
					<Button onClick={this.onSignIn(controller)}>{$L('OK')}</Button>
					<Button onClick={this.onDialogCancel(controller)}>{$L('CANCEL')}</Button>
				</buttons>
			</Notification>
		);
	}
}

export default AuthDialog;
