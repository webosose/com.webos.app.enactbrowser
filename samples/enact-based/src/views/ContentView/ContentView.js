// Copyright (c) 2018 LG Electronics, Inc.
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
import ri from '@enact/ui/resolution';

import BookmarkBar from '../../components/BookmarkBar';
import BookmarkManager from '../BookmarkManager';
import ErrorPage from '../ErrorPage';
import History from '../History';
import NewTabPage from '../NewTabPage';
import Settings from '../Settings';
import SiteFiltering from '../SiteFiltering';
import {TabTypes} from '../../NevaLib/BrowserModel';
import WebView from '../WebView';

import css from './ContentView.less';

const
	hideStyle = {
		display: 'none'
	},
	fullScreenStyle = {
		top: '0',
		height: '100vh'
	}

const ContentViewBase = kind({
	name: 'ContentView',
	propTypes: {
		alwaysShowBookmarks: PropTypes.bool,
		browser: PropTypes.object,
		fullScreen: PropTypes.bool,
		ids: PropTypes.array,
		tabs: PropTypes.object,
		selectedIndex: PropTypes.number
	},
	styles: {
		css,
		className: 'contentView'
	},
	render: ({alwaysShowBookmarks, browser, fullScreen, selectedIndex, ids, tabs, ...rest}) => {
		const
			sortedIds = ids.slice(),
			selectedId = ids[selectedIndex];

		sortedIds.sort((a, b) => (a - b));

		return (
			<div {...rest} className={fullScreen ? css.contentViewFullScreen : css.contentView}>
				<BookmarkBar browser={browser} showingBookmark={(selectedId && tabs[selectedId].type === TabTypes.NEW_TAB_PAGE) || (alwaysShowBookmarks && !fullScreen)} />
				{sortedIds.map((id) => {
					let style = Object.assign({}, hideStyle);
					if (id === selectedId) {
						style = {};
						if (fullScreen) {
							style = fullScreenStyle;
						}
					}

					switch (tabs[id].type) {
						case TabTypes.WEBVIEW: {
							if (!fullScreen && alwaysShowBookmarks) {
								style.top = ri.scale(269) + 'px';
							}

							return (
								<div key={id}>
									<WebView style={style} id={id} webView={browser.webViews[id]} className={css.webView} />
									{ tabs[id].error ?
										<ErrorPage style={style} errorMsg={tabs[id].error} /> :
										null
									}
								</div>
							);
						}
						case TabTypes.NEW_TAB_PAGE:
							return <NewTabPage style={style} key={id} browser={browser} isSelectedTab={id === selectedId} />;
						case TabTypes.SETTINGS:
							return <Settings style={style} key={id} browser={browser} />;
						case TabTypes.SITE_FILTERING:
							return <SiteFiltering style={style} key={id} browser={browser} />;
						case TabTypes.BOOKMARKS:
							return <BookmarkManager style={style} key={id} browser={browser} />;
						case TabTypes.HISTORY:
							return <History style={style} key={id} browser={browser} isSelectedTab={id === selectedId} />;
					}
				})}
			</div>
		);
	}
});

const mapStateToProps = ({tabsState, settingsState}) => {
	const {ids, selectedIndex, tabs} = tabsState;
	return {
		ids,
		tabs,
		selectedIndex,
		alwaysShowBookmarks: settingsState.alwaysShowBookmarks
	};
};

const mapDispatchToProps = () => ({

});

const ContentView = connect(mapStateToProps, mapDispatchToProps)(ContentViewBase);

export default ContentView;
