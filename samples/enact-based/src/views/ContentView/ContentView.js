// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

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
import {TabTypes} from '../../NevaLib/BrowserModel';
import ContentItem from './ContentItem';

import css from './ContentView.module.less';

const ContentViewBase = kind({
	name: 'ContentView',
	propTypes: {
		alwaysShowBookmarks: PropTypes.bool,
		browser: PropTypes.object,
		fullScreen: PropTypes.bool,
		ids: PropTypes.array,
		tabs: PropTypes.object,
		selectedIndex: PropTypes.number,
		innerRef: PropTypes.object,
		onExitFullScreen: PropTypes.any
	},
	styles: {
		css,
		className: 'contentView'
	},
	render: ({alwaysShowBookmarks, browser, fullScreen, selectedIndex, ids, tabs, innerRef, onExitFullScreen, ...rest}) => {
		const
			sortedIds = ids.slice(),
			selectedId = ids[selectedIndex];

		sortedIds.sort((a, b) => (a - b));

		return (
			<div {...rest} className={fullScreen ? css.contentViewFullScreen : css.contentView}>
				<BookmarkBar browser={browser} showingBookmark={(!fullScreen && selectedId && tabs[selectedId].type === TabTypes.NEW_TAB_PAGE) || (alwaysShowBookmarks && !fullScreen)} />
				{sortedIds.map((id) => {
					const
						isSelectedTab = id === selectedId,
						itemAttrs = {alwaysShowBookmarks, browser, fullScreen, id, isSelectedTab, tabs},
						wrapperAttrs = isSelectedTab ? {ref: innerRef} : {};
					wrapperAttrs.key = id;

					return (
						<div {...wrapperAttrs}>
							<ContentItem {...itemAttrs} />
							{ fullScreen &&
								<ExitFullScreenButton
									fullScreen={fullScreen}
									onExitFullScreen={onExitFullScreen}
								/>
							}
						</div>
					);
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

// We export innerRef to call webkitRequestFullscreen() on current tab element
const ContentViewWithRef = React.forwardRef((props, ref) =>
		<ContentView innerRef={ref} {...props} />
	);

export default ContentViewWithRef;
