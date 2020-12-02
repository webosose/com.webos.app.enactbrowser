// Copyright (c) 2018-2020 LG Electronics, Inc.
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
import Button from '@enact/agate/Button';
import Input from '@enact/agate/Input';
import Popup from '@enact/agate/Popup';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import css from './Dialog.module.less';

class Dialog extends Component {
	static propTypes = {
		dialog: PropTypes.object,
		onCancel: PropTypes.func,
		onOK: PropTypes.func
	};

	constructor (props) {
		super(props);
		this.state = {
			value: props.dialog.defaultPromptText || ''
		};
	}

	onDialogOK = (controller) => () => {
		this.props.onOK();
		controller.ok(this.state.value);
	};

	onDialogCancel = (controller) => () => {
		this.props.onCancel();
		controller.cancel();
	};

	onChange = (ev) => {
		this.setState({value: ev.value});
	};

	render () {
		const
			{dialog} = this.props,
			{value} = this.state,
			{messageType, messageText, dialog: dialogController} = dialog;

		return (
			<Popup
				centered
				closeButton
				noAutoDismiss
				open
				onClose={this.onDialogCancel(dialogController)}
			>
				<p>{messageText}</p>
				{
					(messageType === 'prompt') ?
						<Input
							className={css.input}
							onChange={this.onChange}
							value={value}
						/> :
						null
				}
				<buttons>
					<Button size="small" onClick={this.onDialogOK(dialogController)}>{$L('OK')}</Button>
					{
						(messageType === 'alert') ?
							null :
							<Button size="small" onClick={this.onDialogCancel(dialogController)}>{$L('CANCEL')}</Button>
					}
				</buttons>
			</Popup>
		);
	}
}

export default Dialog;
