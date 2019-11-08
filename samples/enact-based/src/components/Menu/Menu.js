// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the Menu component.
 *
 */

import kind from '@enact/core/kind';
import $L from '@enact/i18n/$L';
import ContextualPopupDecorator from '@enact/moonstone/ContextualPopupDecorator';
import Item from '@enact/moonstone/Item';
import IconButton from '@enact/moonstone/IconButton';
import React, {Component} from 'react';

const MenuIconButton = kind({
	name: 'MenuIconButton',
	render: (props) => (
		<IconButton
			{...props}
		>
			list
		</IconButton>
	)
});

const MenuPopupButton = ContextualPopupDecorator(MenuIconButton);

class Menu extends Component {
	constructor (props) {
		super(props);
		this.state = {
			isOpened: false
		}
	}

	renderPopup = () => (
		<div onClick={this.closeMenu}>
			<Item onClick={this.openHistory}>{$L('History')}</Item>
			<Item onClick={this.openBookmarks}>{$L('Bookmarks')}</Item>
			<Item onClick={this.openSettings}>{$L('Settings')}</Item>
			{this.props.browser.devSettingsEnabled &&
				<Item onClick={this.openDevSettings}>DevSettings</Item>
			}
		</div>
	)

	toggleMenu = () => {
		const isOpened = !this.state.isOpened;
		setTimeout(()=> {this.setState({isOpened});}, 100);
	}

	closeMenu = () => {
		this.setState({isOpened: false});
	}

	openHistory = () => {
		this.props.browser.openHistory();
	}

	openBookmarks = () => {
		this.props.browser.openBookmarks();
	}

	openSettings = () => {
		this.props.browser.openSettings();
	}

	openDevSettings = () => {
		this.props.browser.openDevSettings();
	}

	render () {
		const props = Object.assign({}, this.props);
		delete props.children;
		delete props.browser;

		return (
			<MenuPopupButton
				direction="down"
				onClick={this.toggleMenu}
				onClose={this.closeMenu}
				open={this.state.isOpened}
				popupComponent={this.renderPopup}
				tooltipText={$L('Menu')}
				size="small"
				{...props}
			/>
		);
	}
}

export default Menu;
