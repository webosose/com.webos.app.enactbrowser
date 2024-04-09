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
 * Contains the declaration for the ContentView component.
 *
 */

import {connect} from 'react-redux';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import BookmarkBar from '../../components/BookmarkBar';
import ExitFullScreenButton from '../../components/ExitFullScreenButton';
import {TabTypes} from 'js-browser-lib/BrowserModel';
import ContentItem from './ContentItem';

import css from './ContentView.module.less';

const ContentViewBase = kind({
	name: 'ContentView',
	propTypes: {
		alwaysShowBookmarks: PropTypes.bool,
		browser: PropTypes.object,
		fullScreen: PropTypes.bool,
		webContentFullScreen: PropTypes.bool,
		ids: PropTypes.array,
		tabs: PropTypes.object,
		selectedIndex: PropTypes.number,
		innerRef: PropTypes.object,
		onExitFullScreen: PropTypes.any,
		exitFullscreenButton: PropTypes.object
	},
	styles: {
		css,
		className: 'contentView'
	},
	computed: {
		showBookmarksBar: ({tabs, fullScreen, alwaysShowBookmarks, ids, selectedIndex}) => {
			try {
				const selectedId = ids[selectedIndex]
				const tabHistory = tabs[selectedId].navState.history;
				const tabType = tabHistory.entries[tabHistory.index];
				return (!fullScreen && selectedId && tabType === TabTypes.NEW_TAB_PAGE) || (alwaysShowBookmarks && !fullScreen);
			} catch (e) {
				return false;
			}
		},
	},
	render: ({alwaysShowBookmarks, browser, fullScreen, webContentFullScreen, selectedIndex, ids, tabs, innerRef, onExitFullScreen, exitFullscreenButton, showBookmarksBar, ...rest}) => {
		const
			sortedIds = ids.slice(),
			selectedId = ids[selectedIndex];

		sortedIds.sort((a, b) => (a - b));

		return (
			<div {...rest} className={fullScreen ? css.contentViewFullScreen : css.contentView}>
				<BookmarkBar browser={browser} showingBookmark={showBookmarksBar} />
				{sortedIds.map((id) => {
					const
						isSelectedTab = id === selectedId,
						itemAttrs = {alwaysShowBookmarks, browser, fullScreen, id, isSelectedTab, tabs},
						wrapperAttrs = isSelectedTab ? {ref: innerRef} : {};
					wrapperAttrs.key = id;

					return (
						<div {...wrapperAttrs} style={ id === selectedId ? {height: '100%'} : {height: '0px'}}>
							<ContentItem {...itemAttrs} style={ id === selectedId ? {height: '100%'} : {height: '0px'}} />
							{
								<ExitFullScreenButton
									fullScreen={fullScreen}
									webContentFullScreen={webContentFullScreen}
									onExitFullScreen={onExitFullScreen}
									browser={browser}
									exitFullscreenButton={exitFullscreenButton}
								/>
							}
						</div>
					);
				})}
			</div>
		);
	}
});

const mapStateToProps = ({tabsState, settingsState, browserState}) => {
	const {ids, selectedIndex, tabs} = tabsState;
	return {
		ids,
		tabs,
		selectedIndex,
		alwaysShowBookmarks: settingsState.alwaysShowBookmarks,
		webContentFullScreen: browserState.webContentFullScreen
	};
};

const mapDispatchToProps = () => ({

});

const ContentView = connect(mapStateToProps, mapDispatchToProps)(ContentViewBase);

// We export innerRef to call webkitRequestFullscreen() on current tab element
const ContentViewWithRef = React.forwardRef((props, ref) =>
		<ContentView innerRef={ref} {...props} />
	);

export default ContentViewWithRef;
