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

import {BrowserIconButton as IconButton} from '../BrowserIconButton';
import css from './Menu.less';

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

	componentDidUpdate () {
		if (this.state.isOpened) {
			this.menu.showAbove("nevaBrowserMenuButton");
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
