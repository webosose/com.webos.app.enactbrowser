// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the TabBar component.
 *
 */

import $L from '@enact/i18n/$L';
import {connect} from 'react-redux';
import classNames from 'classnames';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {BrowserIconButton as IconButton} from '../BrowserIconButton';
import Tab from './Tab';
import {TabTypes} from '../../NevaLib/BrowserModel';
import Sortable from '../Sortable';

import css from './TabBar.less';

const placeholder = (typeof document === 'object') ? document.createElement('li') : null;

if (placeholder) {
	placeholder.setAttribute('style', 'display: flex; width: 210px; margin-right: 21px; padding: 6px; background-color: white; opacity: 0.6; border: dotted 2px grey;');
	placeholder.innerHTML = 'drop here';
}

const NewTabButton = kind({
	name: 'NewTabButton',
	propTypes: {
		onNew: PropTypes.func
	},
	styles: {
		css,
		className: 'newTab'
	},
	render: ({onNew, ...rest}) => (
		<li {...rest}>
			<IconButton
				backgroundOpacity="transparent"
				onClick={onNew}
				type="newTabButton"
				withBg
			/>
		</li>
	)
});

class TabBarBase extends Component {
	static propTypes = {
		browser: PropTypes.object,
		component: PropTypes.any,
		numOfTabs: PropTypes.number,
		selectedIndex: PropTypes.number,
		tabStates: PropTypes.object,
		ids: PropTypes.array,
	}

	componentWillReceiveProps (nextProps) {
		if (this.props.selectedIndex !== nextProps.selectedIndex) {
			const
				{browser, ids} = this.props,
				prevSelectedId = ids[this.props.selectedIndex],
				webViewToBlur = browser.webViews[prevSelectedId];

				if (webViewToBlur) {
					webViewToBlur.blur();
				}
		}
	}

	componentDidUpdate (prevProps) {
		const
			{browser, selectedIndex, tabStates, ids} = this.props,
			prevSelectedId = ids[prevProps.selectedIndex],
			selectedId = ids[selectedIndex],
			selectedTab = tabStates[selectedId];

		// Focusing the current webview started loading / when selected a tab
		if (selectedTab && selectedTab.type === TabTypes.WEBVIEW) {
			if (prevSelectedId !== selectedIndex || selectedTab.navState.isLoading) {
				browser.webViews[selectedId].focus();
			}
		}
	}

	tabs = () => {
		const {browser, component: TabElem, numOfTabs, selectedIndex, tabStates, ids} = this.props;
		let
			tabs = [],
			closable = numOfTabs > 1;

		for (let i = 0; i < numOfTabs; i++) {
			const
				tabState = tabStates[ids[i]],
				error = tabState ? tabState.error : null,
				type = tabState ? tabState.type : null;
			let title = '';

			if (tabState) {
				if (type === 'history') {
					title = $L('History');
				} else if (type === 'bookmarks') {
					title = $L('Bookmarks');
				} else if (type === 'settings') {
					title = $L('Settings');
				} else if (type === 'newTabPage') {
					title = $L('New Tab');
				} else if (error || tabState.title === 'Loading...') {
					title = tabState.navState.url;
				} else {
					title = tabState.title;
				}
			}

			tabs.push(
				<TabElem
					browser={browser}
					closable={closable}
					data-id={i}
					error={error}
					iconUrl={tabState ? tabState.icon : null}
					index={i}
					key={i}
					selected={i === selectedIndex}
					title={title}
					type={type}
				/>
			);
		}

		return tabs;
	}

	onNew = () => {
		const {browser, numOfTabs} = this.props;

		if (numOfTabs < browser.tabs.maxTabs) {
			browser.createNewTab();
		}
	}

	onMove = (fromIndex, toIndex) => {
		this.props.browser.moveTab(fromIndex, toIndex);
	}

	render = () => {
		const
			{className, numOfTabs, ...rest} = this.props,
			classes = classNames(className, css.tabBar);

		delete rest.tabStates;
		delete rest.component;
		delete rest.numOfTabs;
		delete rest.selectedIndex;
		delete rest.closableTabs;
		delete rest.browser;
		delete rest.ids;
		delete rest.dispatch;

		return (
			<ul className={classes} {...rest}>
				{this.tabs()}
				{numOfTabs < 7 ? <NewTabButton onNew={this.onNew} /> : null}
			</ul>
		);
	}
}

const SortableTabBar = Sortable({component: Tab, placeholder}, TabBarBase);

const mapStateToProps = ({tabsState}) => {
	const
		{ids, selectedIndex, tabs} = tabsState;
	return {
		numOfTabs: ids.length,
		ids,
		selectedIndex,
		tabStates: tabs,
	};
};

const TabBar = connect(mapStateToProps, null)(SortableTabBar);

export default TabBar;
export {TabBar, Tab};
