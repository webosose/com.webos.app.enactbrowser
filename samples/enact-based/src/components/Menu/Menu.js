// Copyright (c) 2018-2022 LG Electronics, Inc.
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

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { isWindowReady } from '@enact/core/snapshot';

import {BrowserIconButton as IconButton} from '../BrowserIconButton';
import Ipc from 'js-browser-lib/Ipc';
import css from './Menu.module.less';

class Menu extends Component {
	static propTypes = {
		browser: PropTypes.object,
	}

	constructor (props) {
		super(props);
		this.state = {
			isOpened: false
		}
		this.menu = props.menu;

		if (isWindowReady()) {
			this.menuIpc = new Ipc("ipc_menu");
			this.menuIpc.subscribe('click', () => {
				this.setState({isOpened: false});
			});
		}
	}

	toggleMenu = () => {
		const isOpened = !this.state.isOpened;
		setTimeout(()=> {this.setState({isOpened});}, 100);
	}

	componentDidUpdate () {
		if (this.state.isOpened) {
			this.menu.showAbove("nevaBrowserMenuButton");

			if (typeof window !== 'undefined') {
				window.document.addEventListener('click', () => {
					console.log(`Menu::on document click event`);
					if (this.state.isOpened) {
						this.setState({isOpened: false});
					}
				}, {once: true});
			}
		} else {
			this.menu.hide();
		}
	}

    render () {
		const props = Object.assign({}, this.props);
		delete props.children;
		delete props.browser;

		return (
			<IconButton
				id="nevaBrowserMenuButton"
				backgroundOpacity="transparent"
				className={css.menuButton}
				onClick={this.toggleMenu}
				open={this.state.isOpened}
				type="menuButton"
				{...props}
			/>
		);
	}
}

export default Menu;
