// Copyright (c) 2018-2020 LG Electronics, Inc.
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
import Button from '@enact/agate/Button';
import ContextualPopupDecorator from '@enact/agate/ContextualPopupDecorator';
import Item from '@enact/agate/Item';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TooltipDecorator from '@enact/agate/TooltipDecorator';

import css from './Menu.module.less';

const MenuIconButton = kind({
	name: 'MenuIconButton',
	render: (props) => (
		<TooltipButton
			{...props}
			icon="menu"
			size="small"
		/>
	)
});

const MenuPopupButton = ContextualPopupDecorator(MenuIconButton);
const TooltipButton = TooltipDecorator({tooltipDestinationProp: 'decoration'}, Button);

class Menu extends Component {
	static get propTypes () {
		return {
			browser: PropTypes.any
		};
	}

	constructor (props) {
		super(props);
		this.state = {
			isOpened: false
		};
	}

	renderPopup = () => (
		<div className={css.menuContainer} onClick={this.closeMenu}>
			<Item css={css} onClick={this.openHistory} skinVariants={{'night': false}}>{$L('History')}</Item>
			<Item css={css} onClick={this.openBookmarks} skinVariants={{'night': false}}>{$L('Bookmarks')}</Item>
			<Item css={css} onClick={this.openSettings} skinVariants={{'night': false}}>{$L('Settings')}</Item>
			{this.props.browser.devSettingsEnabled &&
				<Item css={css} onClick={this.openDevSettings} skinVariants={{'night': false}}>DevSettings</Item>
			}
		</div>
	);

	toggleMenu = () => {
		const isOpened = !this.state.isOpened;
		setTimeout(() => {
			this.setState({isOpened});
		}, 100);
	};

	closeMenu = () => {
		this.setState({isOpened: false});
	};

	openHistory = () => {
		this.props.browser.openHistory();
	};

	openBookmarks = () => {
		this.props.browser.openBookmarks();
	};

	openSettings = () => {
		this.props.browser.openSettings();
	};

	openDevSettings = () => {
		this.props.browser.openDevSettings();
	};

	render () {
		const props = Object.assign({}, this.props);
		delete props.children;
		delete props.browser;

		return (
			<MenuPopupButton
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
