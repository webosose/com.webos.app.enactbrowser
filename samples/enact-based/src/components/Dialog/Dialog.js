// Copyright (c) 2018-2019 LG Electronics, Inc.
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
import Notification from '@enact/moonstone/Notification';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import css from './Dialog.module.less';

class Dialog extends Component {
	static props = {
		dialog: PropTypes.object,
		onOK: PropTypes.func,
		onCancel: PropTypes.func,
	}

	constructor (props) {
		super(props);
		this.state = {
			value: props.dialog.defaultPromptText || ''
		};
	}

	onDialogOK = (controller) => () => {
		this.props.onOK();
		controller.ok(this.state.value);
	}

	onDialogCancel = (controller) => () => {
		this.props.onCancel();
		controller.cancel();
	}

	onChange = (ev) => {
		this.setState({value: ev.value});
	}

	render () {
		const
			{dialog} = this.props,
			{value} = this.state,
			{messageType, messageText, dialog: dialogController} = dialog;

		return (
			<Notification
				noAutoDismiss
				open
				onClose={this.onDialogCancel(dialogController)}
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
				<buttons>
					<Button onClick={this.onDialogOK(dialogController)}>{$L('OK')}</Button>
					{
						(messageType === 'alert') ?
						null
						: <Button onClick={this.onDialogCancel(dialogController)}>{$L('CANCEL')}</Button>
					}
				</buttons>
			</Notification>
		);
	}
}

export default Dialog;
