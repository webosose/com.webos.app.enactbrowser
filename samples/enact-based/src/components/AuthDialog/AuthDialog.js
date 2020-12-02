// Copyright (c) 2019-2020 LG Electronics, Inc.
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
import Button from '@enact/agate/Button';
import Input from '@enact/agate/Input';
import Popup from '@enact/agate/Popup';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

class AuthDialog extends Component {
	static propTypes = {
		controller: PropTypes.object
	};

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
	};

	onDialogCancel = (controller) => () => {
		controller.cancel();
	};

	onChangeUsername = (ev) => {
		this.setState({username: ev.value});
	};

	onChangePassword = (ev) => {
		this.setState({password: ev.value});
	};

	render () {
		const
			{controller} = this.props,
			{username, password} = this.state;

		return (
			<Popup
				centered
				closeButton
				noAutoDismiss
				open
				onClose={this.onDialogCancel(controller)}
			>
				<p>Username</p>
				<Input
					onChange={this.onChangeUsername}
					value={username}
				/>
				<p>Password</p>
				<Input
					onChange={this.onChangePassword}
					value={password}
					type="password"
				/>
				<buttons>
					<Button size="small" onClick={this.onSignIn(controller)}>{$L('OK')}</Button>
					<Button size="small" onClick={this.onDialogCancel(controller)}>{$L('CANCEL')}</Button>
				</buttons>
			</Popup>
		);
	}
}

export default AuthDialog;
