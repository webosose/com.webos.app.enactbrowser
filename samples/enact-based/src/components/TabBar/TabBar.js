// Copyright (c) 2018-2020 LG Electronics, Inc.
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
import { connect } from 'react-redux';
import classNames from 'classnames';
import Button from '@enact/agate/Button';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import TooltipDecorator from '@enact/agate/TooltipDecorator';

import Tab from './Tab';
import { TabTypes } from '../../NevaLib/BrowserModel';
import Sortable from '../Sortable';
import Spotlight from '@enact/spotlight';

import css from './TabBar.module.less';
import { setRedIndicator } from '../../NevaLib/Tabs/actions';

const TooltipButton = TooltipDecorator({ tooltipDestinationProp: 'decoration' }, Button);

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
	render: ({ onNew, ...rest }) => (
		<li {...rest}>
			<TooltipButton
				backgroundOpacity="transparent"
				onClick={onNew}
				icon="plus"
				size="small"
				tooltipText={$L('New Tab')}
			/>
		</li>
	)
});

class TabBarBase extends Component {
	constructor(props) {
		super(props)
		this.state = { customEventSent: true }
	}
	static propTypes = {
		browser: PropTypes.object,
		component: PropTypes.any,
		fullScreen: PropTypes.bool,
		ids: PropTypes.array,
		numOfTabs: PropTypes.number,
		selectedIndex: PropTypes.number,
		tabStates: PropTypes.object
	};

	componentDidMount() {
		document.addEventListener('webOSLocaleChange', this.onLocaleChange);
		if (window && window.navigator) {
			console.log("Listening to media events...")
			window.navigator.mediacapture.onaudiocapturestate = this.handleAudioCapture
			window.navigator.mediacapture.onvideocapturestate = this.handleVideoCapture
		}
	}

	triggerCustomCloseEvent = (media) => {
		if (!this.state.customEventSent) {
			media == "audio" && this.props.setRedIndicator({ index: this.props.closedTabId, audio: false })
			media == "video" && this.props.setRedIndicator({ index: this.props.closedTabId, video: false })
		}
	}

	handleAudioCapture = (eventStatus) => {
		console.log("AudioEvent Status ==> ", eventStatus)
		let selectedTabIndex = Object.keys(this.props.tabStates)[this.props.selectedIndex]  //which TabId
		if (this.props.closedTabId != null) {

			!this.state.customEventSent && this.triggerCustomCloseEvent("audio")

		} else if (this.props.closedTabId == null) {
			if (this.state.customEventSent) {
				this.props && this.props.setRedIndicator({ index: selectedTabIndex, audio: eventStatus })
			}
		}
	}

	handleVideoCapture = (eventStatus) => {
		console.log("VideoEvent Status ==> ", eventStatus)
		let selectedTabIndex = Object.keys(this.props.tabStates)[this.props.selectedIndex]  //which TabId

		if (this.props.closedTabId !== null) {

			!this.state.customEventSent && this.triggerCustomCloseEvent("video")
		} else if (this.props.closedTabId === null) {
			if (this.state.customEventSent && this.props) {
				this.props.setRedIndicator({ index: selectedTabIndex, video: eventStatus })
			}
		}
	}

	onLocaleChange = () => {
		setTimeout(() => {
			this.forceUpdate();
		}, 1000);
	}

	componentWillReceiveProps(nextProps) {

		//when tab with red indicator is closed
		if (this.props.closedTabId !== nextProps.closedTabId) {
			console.log("this.props.closedTabId=>", this.props.closedTabId, "nextProps.closedTabId=>", nextProps.closedTabId)
			nextProps.closedTabId != null && this.setState({
				customEventSent: false
			})


			nextProps.closedTabId == null &&
				this.setState({
					customEventSent: true
				}, () => console.log("CUSTOM events closed with value=========>", this.state.customEventSent))
		}

		if (this.props.selectedIndex !== nextProps.selectedIndex) {
			const
				{ browser, ids } = this.props,
				prevSelectedId = ids[this.props.selectedIndex],
				webViewToBlur = browser.webViews[prevSelectedId];

			if (webViewToBlur) {
				// Restore WebView content after shifting from VKB if needed
				let script = `
					if (typeof document_style_transform_backup != "undefined")
						document.body.style.transform = document_style_transform_backup;
					`;
				webViewToBlur.executeScript({ code: script });
				webViewToBlur.blur();
			}
		}
	}

	componentDidUpdate(prevProps) {
		const
			{ browser, selectedIndex, tabStates, ids } = this.props,
			prevSelectedId = ids[prevProps.selectedIndex],
			prevSelectedTab = prevProps.tabStates[prevSelectedId],
			prevUrl = prevSelectedTab ? prevSelectedTab.navState.url : '',
			selectedId = ids[selectedIndex],
			selectedTab = tabStates[selectedId];

		// Focusing the current webview started loading / when selected a tab
		if (selectedTab && selectedTab.type === TabTypes.WEBVIEW) {
			const { isLoading, url } = selectedTab.navState;
			if (prevSelectedId !== selectedId || (isLoading && url !== prevUrl)) {
				browser.webViews[selectedId].focus();
				Spotlight.pause();
			}
		} else {
			Spotlight.resume();
		}
	}

	tabs = () => {
		const { browser, component: TabElem, numOfTabs, selectedIndex, tabStates, ids, displayRedIndicator } = this.props;
		let tabs = [];

		for (let i = 0; i < numOfTabs; i++) {
			const
				tabState = tabStates[ids[i]],
				error = tabState ? tabState.error : null,
				type = tabState ? tabState.type : null,
				closable = numOfTabs > 1 || type !== 'newTabPage';
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

			let showRedIndicator = displayRedIndicator && displayRedIndicator.length > 0 && displayRedIndicator.some(j => j["index"] == Object.keys(tabStates)[i] && (j["audio"] == true || j["video"] == true))

			tabs.push(
				<TabElem
					browser={browser}
					closable={closable}
					data-id={i}
					error={error}
					iconUrl={tabState ? tabState.icon : null}
					index={i}
					isLoading={tabState && tabState.navState.isLoading && !tabState.error}
					key={i}
					selected={i === selectedIndex}
					title={title}
					type={type}
					showRedIndicator={showRedIndicator}
				/>
			);
		}

		return tabs;
	};

	onNew = () => {
		const { browser, numOfTabs } = this.props;

		if (numOfTabs < browser.tabs.maxTabs) {
			browser.createNewTab();
		}
	};

	onMove = (fromIndex, toIndex) => {
		this.props.browser.moveTab(fromIndex, toIndex);
	};

	render = () => {
		const
			{ className, numOfTabs, fullScreen, ...rest } = this.props,
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
			!fullScreen ?
				<ul className={classes} {...rest}>
					{this.tabs()}
					{numOfTabs < 7 ? <NewTabButton onNew={this.onNew} /> : null}
				</ul> :
				null
		);
	};
}

const SortableTabBar = Sortable({ component: Tab, placeholder }, TabBarBase);

const mapStateToProps = ({ tabsState }) => {
	const
		{ ids, selectedIndex, tabs, displayRedIndicator, closedTabId } = tabsState;
	return {
		numOfTabs: ids.length,
		ids,
		selectedIndex,
		tabStates: tabs,
		displayRedIndicator: displayRedIndicator,
		closedTabId: closedTabId
	};
};

const mapDispatchToProps = (dispatch) => ({
	setRedIndicator: (data) => dispatch(setRedIndicator(data))
});

const TabBar = connect(mapStateToProps, mapDispatchToProps)(SortableTabBar);

export default TabBar;
export { TabBar, Tab };
