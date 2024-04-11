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
	}

	toggleMenu = () => {
		const isOpened = !this.state.isOpened;
		setTimeout(()=> {this.setState({isOpened});}, 100);
	}

	componentDidMount() {
		this.menu.menuIpc.ipcObject.on('click', () => {
			if (this.state.isOpened) {
				this.setState({isOpened: false});
			}
		})
	}

	componentDidUpdate () {
		if (this.state.isOpened) {
			this.menu.showAbove("nevaBrowserMenuButton");

			if (typeof window !== 'undefined') {
				['click', 'tab-select'].forEach(ev => {
					window.document.addEventListener(ev, () => {
						console.log(`Menu::on document ${ev} event`);
						if (this.state.isOpened) {
							this.setState({isOpened: false});
						}
					}, {once: true});
				})
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
			<Button
				id="nevaBrowserMenuButton"
				backgroundOpacity="transparent"
				className={css.menuButton}
				onClick={this.toggleMenu}
				open={this.state.isOpened}
				icon="menu"
				size="large"
				{...props}
			/>
		);
	}
}

export default Menu;
