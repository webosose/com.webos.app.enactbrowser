// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import MoonstoneDecorator from '@enact/moonstone/MoonstoneDecorator';
import Item from '@enact/moonstone/Item';
import React, {Component} from 'react';
import $L from '@enact/i18n/$L';
import {Menu} from '../components/MenuModel';

import css from './App.less';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			menu: new Menu(),
		}
	}

	onClick = (menuItem) => () => {
		this.state.menu.click(menuItem);
	}

	componentDidMount() {
		this.state.menu.notifyCreated();
	}

	render() {
		return (
			<div id="menu" {...this.props} className={css.topArea}>
				<Item
					minWidth={false}
					className={css.menuItem}
					onClick={this.onClick('history')}
				>
					{$L('History')}
				</Item>
				<Item
					minWidth={false}
					onClick={this.onClick('bookmarks')}
				>
					{$L('Bookmarks')}
				</Item>
				<Item
					minWidth={false}
					className={css.menuItem}
					onClick={this.onClick('settings')}
				>
					{$L('Settings')}
				</Item>
				<Item
					minWidth={false}
					className={css.menuItem}
					onClick={this.onClick('devSettings')}
				>
					{$L('Dev Settings')}
				</Item>
			</div>
		);
	}
}

export default MoonstoneDecorator(App);
