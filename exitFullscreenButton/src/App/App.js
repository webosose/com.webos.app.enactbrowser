// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import MoonstoneDecorator from '@enact/moonstone/MoonstoneDecorator';
import Button from '@enact/moonstone/Button';
import React, {Component} from 'react';
import $L from '@enact/i18n/$L';
import {ExitButton} from '../components/ButtonModel';

import css from './App.less';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			exitButton: new ExitButton(),
		}
	}

	onClick = () => {
		this.state.exitButton.click();
	}

	render() {
		return (
			<div {...this.props} className={css.topArea}>
				<Button
					minWidth={false}
					className={css.exitButton}
					onClick={this.onClick}
				>
					{$L('Exit Full Screen')}
				</Button>
			</div>
		);
	}
}

export default MoonstoneDecorator(App);
