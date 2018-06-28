/**
 * Contains the declaration for the Menu component.
 *
 */

import ContextualPopupDecorator from '@enact/moonstone/ContextualPopupDecorator';
import Item from '@enact/moonstone/Item';
import React, {Component} from 'react';

import BrowserIconButton from '../BrowserIconButton';
import css from './Menu.less';

const MenuPopupButton = ContextualPopupDecorator(BrowserIconButton);

class Menu extends Component {
	constructor (props) {
		super(props);
		this.state = {
			isOpened: false
		}
	}

	renderPopup = () => (
		<div onClick={this.closeMenu}>
			<Item onClick={this.openHistory}>History</Item>
			<Item onClick={this.openBookmarks}>Bookmarks</Item>
			<Item onClick={this.openSettings}>Settings</Item>
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
				tooltipText="Menu"
				type="menuButton"
				{...props}
			/>
		);
	}
}

export default Menu;
