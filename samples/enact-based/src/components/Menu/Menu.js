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

import $L from '@enact/i18n/$L';
import ContextualPopupDecorator from '@enact/moonstone/ContextualPopupDecorator';
import React, {Component} from 'react';

import BrowserIconButton from '../BrowserIconButton';
import css from './Menu.less';
import MenuPopup from './MenuPopup';

const MenuPopupButton = ContextualPopupDecorator(BrowserIconButton);

class Menu extends Component {
	constructor (props) {
		super(props);
		this.state = {
			isOpened: false
		}
	}

	renderPopup = () => {
		return (
			<MenuPopup {...this.props}/>
		);
	}

	toggleMenu = () => {
		const isOpened = !this.state.isOpened;
		setTimeout(()=> {this.setState({isOpened});}, 100);
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
				backgroundOpacity="transparent"
				className={css.menuButton}
				direction="down"
				onClick={this.toggleMenu}
				onClose={this.closeMenu}
				open={this.state.isOpened}
				popupComponent={this.renderPopup}
				tooltipText={$L('Menu')}
				type="menuButton"
				{...props}
			/>
		);
	}
}

export default Menu;
