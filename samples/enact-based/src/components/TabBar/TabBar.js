// Copyright 2018 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Contains the declaration for the TabBar component.
 *
 */

import $L from '@enact/i18n/$L';
import {connect} from 'react-redux';
import classNames from 'classnames';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import {Component} from 'react';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';

import Button from '@enact/agate/Button';
import Tab from './Tab';
import {setRedIndicator} from 'js-browser-lib/ReduxComponents/Tabs/actions';
import {TabTypes} from 'js-browser-lib/BrowserModel';
import Sortable from '../Sortable';
import Spotlight from '@enact/spotlight';

import css from './TabBar.module.less';

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
			<Button
				backgroundOpacity="transparent"
				onClick={onNew}
				icon="plus"
				size="small"
			/>
		</li>
	)
});

class TabBarBase extends Component {
	constructor(props) {
		super(props)
		this.state = {customEventSent: true}
	}
	static propTypes = {
		browser: PropTypes.object,
		component: PropTypes.any,
		numOfTabs: PropTypes.number,
		selectedIndex: PropTypes.number,
		tabStates: PropTypes.object,
		ids: PropTypes.array,
		fullScreen: PropTypes.bool
	}

	UNSAFE_componentWillReceiveProps (nextProps) {
		if (this.props.selectedIndex !== nextProps.selectedIndex) {
			console.log(`WVE remove vkb inset when hide vkb. (NEVA-6205)`);
		}
	};

	componentDidMount() {
		if (window?.navigator?.mediacapture) {
			console.log('Listening to media events...')
			window.navigator.mediacapture.onaudiocapturestate = this.handleAudioCapture
			window.navigator.mediacapture.onvideocapturestate = this.handleVideoCapture
		}
	}

	triggerCustomCloseEvent = (media) => {
		if (!this.state.customEventSent) {
			media == 'audio' && this.props.setRedIndicator({index: this.props.closedTabId, audio: false})
			media == 'video' && this.props.setRedIndicator({index: this.props.closedTabId, video: false})
		}
	}

	handleAudioCapture = (eventStatus) => {
		console.log('AudioEvent Status ==> ', eventStatus)
		let selectedTabIndex = Object.keys(this.props.tabStates)[this.props.selectedIndex]  //which TabId
		if (this.props.closedTabId != null) {
			!this.state.customEventSent && this.triggerCustomCloseEvent('audio')
		} else if (this.props.closedTabId == null && this.state.customEventSent) {
			this.props && this.props.setRedIndicator({index: selectedTabIndex, audio: eventStatus})
		}
	}

	handleVideoCapture = (eventStatus) => {
		console.log('VideoEvent Status ==> ', eventStatus)
		let selectedTabIndex = Object.keys(this.props.tabStates)[this.props.selectedIndex]  //which TabId
		if (this.props.closedTabId !== null) {
			!this.state.customEventSent && this.triggerCustomCloseEvent('video')
		} else if (this.props.closedTabId === null) {
			if (this.state.customEventSent && this.props) {
				this.props.setRedIndicator({index: selectedTabIndex, video: eventStatus})
			}
		}
	}

	componentWillReceiveProps(nextProps) {
		//when tab with red indicator is closed
		if (this.props.closedTabId !== nextProps.closedTabId) {
			console.log('this.props.closedTabId=>', this.props.closedTabId, 'nextProps.closedTabId=>', nextProps.closedTabId)
			this.setState({customEventSent: nextProps.closedTabId == null})
		}
	}

	componentDidUpdate(prevProps) {
		const
			{browser, selectedIndex, tabStates, ids} = this.props,
			prevSelectedId = ids[prevProps.selectedIndex],
			selectedId = ids[selectedIndex],
			selectedTab = tabStates[selectedId];

		// Focusing the current webview started loading / when selected a tab
		if (selectedTab && selectedTab.type === TabTypes.WEBVIEW) {
			if (prevSelectedId !== selectedIndex || selectedTab.navState.isLoading) {
				browser.webViews[selectedId].focus();
				Spotlight.pause();
			}
		} else {
			Spotlight.resume();
		}
	}

	tabs = () => {
		const {browser, component: TabElem, numOfTabs, selectedIndex, tabStates, ids, displayRedIndicator} = this.props;
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

			const showRedIndicator = displayRedIndicator && displayRedIndicator.length > 0 && displayRedIndicator.some(j => j['index'] == Object.keys(tabStates)[i] && (j['audio'] == true || j['video'] == true))

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

	onDragEnd = result => {
		const {destination, source} = result;

		if (!destination) {
			return;
		}

		if (destination.droppableId === source.droppableId && destination.index === source.index) {
			return;
		}

		this.onMove(source.index, destination.index);
	}

	render = () => {
		const
			{className, numOfTabs, fullScreen, ...rest} = this.props,
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
			<DragDropContext onDragEnd={this.onDragEnd}>
			<Droppable droppableId='tabbar' direction='horizontal'>
			{provided => (
			<ul
				className={classes}
				{...rest}
				ref={provided.innerRef}
				{...provided.droppableProps}
			>
				{this.tabs()}
				{provided.placeholder}
				{numOfTabs < 7 ? <NewTabButton onNew={this.onNew} /> : null}
			</ul>
			)}
			</Droppable>
			</DragDropContext>
			: null
		);
	}
}

const SortableTabBar = Sortable({component: Tab, placeholder}, TabBarBase);

const mapStateToProps = ({tabsState}) => {
	const
		{ids, selectedIndex, tabs, displayRedIndicator, closedTabId} = tabsState;
	return {
		numOfTabs: ids.length,
		ids,
		selectedIndex,
		tabStates: tabs,
		displayRedIndicator,
		closedTabId,
	};
};

const mapDispatchToProps = (dispatch) => ({
	setRedIndicator: (data) => dispatch(setRedIndicator(data))
});

const TabBar = connect(mapStateToProps, mapDispatchToProps)(SortableTabBar);

export default TabBar;
export {TabBar, Tab};
