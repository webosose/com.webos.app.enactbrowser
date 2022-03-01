import $L from '@enact/i18n/$L';
import Item from '@enact/moonstone/Item';
import React, {Component} from 'react';

class MenuPopup extends Component {
    constructor(props) {
        super(props);
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

    closeMenu = () => {
        this.setState({isOpened: false});
    }

    componentDidMount () {
        this.props.browser.createMenu();
    }

    componentDidUpdate () {
        this.props.browser.showMenuAbove("nevaBrowserMenu");
    }

    componentWillUnmount() {
        this.props.browser.hideMenu();
    }

    render() {
        return (
            <div id="nevaBrowserMenu" onClick={this.closeMenu}>
                <Item onClick={this.openHistory}>{$L('History')}</Item>
                <Item onClick={this.openBookmarks}>{$L('Bookmarks')}</Item>
                <Item onClick={this.openSettings}>{$L('Settings')}</Item>
                {this.props.browser.devSettingsEnabled &&
                    <Item onClick={this.openDevSettings}>DevSettings</Item>
                }
            </div>
        )
    }
}

export default MenuPopup;
