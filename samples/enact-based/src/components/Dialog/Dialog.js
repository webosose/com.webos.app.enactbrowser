// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the Dialog component.
 *
 */

import $L from '@enact/i18n/$L';
import Button from '@enact/moonstone/Button';
import Input from '@enact/moonstone/Input';
import Checkbox from '@enact/moonstone/Checkbox';
import Notification from '@enact/moonstone/Notification';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import css from './Dialog.less';

class Dialog extends Component {
	static props = {
		dialog: PropTypes.object
	}

	constructor (props) {
		super(props);
		this.state = {
			value: props.dialog.defaultPromptText || '',
			passwdValue: '',
			loginValue: ''
		};
	}

	onOk = () => {
		if (this.props.dialog.messageType === 'auth') {
			this.props.dialog.ok(this.state.loginValue, this.state.passwdValue);
		} else {
			this.props.dialog.ok(this.state.value);
		}
		this.setState({loginValue: ""});
		this.setState({passwdValue: ""});
		this.setState({value: ""});
	}

	onCancel = () => {
		this.props.dialog.cancel();
		this.setState({value: ""});
	}

	componentWillUnmount() {
		this.onCancel();
	}

	onChange = (ev) => {
		this.setState({value: ev.value});
	}

	onLoginChange = (ev) => {
		this.setState({loginValue: ev.value});
	}

	onPasswdChange = (ev) => {
		this.setState({passwdValue: ev.value});
	}

	onToggle = (ev) => {
		if (ev.selected) {
			this.props.dialog.blockDialogs();
		}
	}

	render () {
		const
			{dialog} = this.props,
			{value, loginValue, passwdValue} = this.state,
			{messageType, messageText,
				alertsCount, alertsCountBeforePreventionRequest} = dialog;
		console.log(dialog);

		let leftButtonText;
		let rightButtonText;
		if (messageType === 'unresponsive') {
			leftButtonText = $L('WAIT 10 sec');
			rightButtonText = $L('CLOSE PAGE');
		} else {
			leftButtonText = $L('OK');
			rightButtonText = $L('CANCEL');
		}

		return (
			<Notification
				noAutoDismiss
				open
				onClose={this.onCancel}
				showCloseButton
			>
				<p>{messageText}</p>
				{
					(messageType === 'prompt') ?
					<Input
						className={css.input}
						onChange={this.onChange}
						value={value}
					/>
					: null
				}
				{
					(messageType === 'auth') ?
					<div>
						<div>
							<span>{$L('  login')}</span>
							<Input
								className={css.input}
								onChange={this.onLoginChange}
								value={loginValue}
							/>
						</div>
						<div>
							<span>{$L('password')}</span>
							<Input
								className={css.input}
								onChange={this.onPasswdChange}
								value={passwdValue}
							/>
						</div>
					</div>
					: null
				}
				{
					(alertsCount >= alertsCountBeforePreventionRequest) ?
						<div>
							<Checkbox className={css.checkbox} css={css} onToggle={this.onToggle}/>
							<span>{$L('Prevent dialogs from opening on this page')}</span>
						</div>
					: null
				}
				<buttons>
					<Button onClick={this.onOk}>{leftButtonText}</Button>
					{
						(messageType === 'alert') ?
						null
						: <Button onClick={this.onCancel}>{rightButtonText}</Button>
					}
				</buttons>
			</Notification>
		);
	}
}

export default Dialog;
export {Dialog};
