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

/*global ShellIpc*/

import {Component} from 'react';
import PropTypes from 'prop-types';

import Button from '@enact/agate/Button';
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
		if (typeof ShellIpc !== 'undefined') {
			this.menuIpc = new ShellIpc("ipc_menu");
		}
	}

	componentDidUpdate(_, prevState) {
		if (prevState.isOpened !== this.state.isOpened) {
			if (this.state.isOpened) {
				this.addClickListeners();
			} else {
				this.removeClickListeners();
			}
		}
	}

	componentWillUnmount() {
		if (this.state.isOpened) {
			this.menu.hide();
			this.removeClickListeners();
		}
	}

	addClickListeners() {
		console.log(`[Menu] addClickListeners`);
		if (this.menuIpc) {
			this.menuIpc.once("click", this.onClickListener);
		}
		window.document.addEventListener('click', this.onClickListener);
	}

	removeClickListeners() {
		console.log(`[Menu] removeClickListeners`);
		if (this.menuIpc) {
			this.menuIpc.removeEventListener("click", this.onClickListener);
		}
		window.document.removeEventListener('click', this.onClickListener);
	}

	toggleMenu = () => {
		console.log(`[Menu] toggleMenu isOpened = `, this.state.isOpened);

		if (!this.state.isOpened) {
			this.menu.showAbove("nevaBrowserMenuButton").then(() => {
				this.setState({isOpened: true});
			});
		} else {
			this.menu.hide();
			this.setState({isOpened: false});
		}
	}

	onClickListener = (event) => {
		const menuElement = window.document.getElementById('nevaBrowserMenuButton');
		const isClickOutside = !menuElement || !menuElement.contains(event.target);
		const isOpened = this.state.isOpened;
		console.log(`[Menu] onClickListener`, {target: event.target, isClickOutside, isOpened});
		if (isClickOutside && isOpened) {
			this.menu.hide();
			this.setState({isOpened: false});
		}
	}

    render () {
		const props = Object.assign({}, this.props);
		delete props.children;
		delete props.browser;

		return (
			<Button
				id="nevaBrowserMenuButton"
				backgroundOpacity="transparent"
				className={css.menuButton}
				onClick={this.toggleMenu}
				icon="menu"
				size="large"
				{...props}
			/>
		);
	}
}

export default Menu;
