// Copyright 2019 LG Electronics, Inc.
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
 * Contains the declaration for the AuthDialog component.
 *
 */

import $L from '@enact/i18n/$L';
import Button from '@enact/agate/Button';
import Input from '@enact/agate/Input';
import Popup from '@enact/agate/Popup';
import PropTypes from 'prop-types';
import {Component} from 'react';

import css from './AuthDialog.module.less';

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
			<Popup
				noAutoDismiss
				open
				onClose={this.onDialogCancel(controller)}
				centered
				closeButton
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
					<Button size="small" onClick={this.onSignIn(controller)}>{$L('OK')}</Button>
					<Button size="small" onClick={this.onDialogCancel(controller)}>{$L('CANCEL')}</Button>
				</buttons>
			</Popup>
		);
	}
}

export default AuthDialog;
