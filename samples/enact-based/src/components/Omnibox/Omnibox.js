// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the Omnibox component.
 *
 */

import $L from '@enact/i18n/$L';
import {connect} from 'react-redux';
import Notification from '@enact/moonstone/Notification';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Spotlight from '@enact/spotlight';

import {BrowserIconButton as IconButton} from '../BrowserIconButton';
import {TabTypes} from '../../NevaLib/BrowserModel';
import AddressBar from './AddressBar';

import css from './Omnibox.less';

class OmniboxBase extends Component {

	static propTypes = {
		bookmarksData: PropTypes.array,
		isLoading: PropTypes.bool,
		reloadDisabled: PropTypes.bool,
		selectedId: PropTypes.string,
		selectedIndex: PropTypes.number,
		url: PropTypes.string,
	}

	constructor (props) {
		super(props);
		this.state = {
			addBookmarkCompleted: false,
			open: false,
			removeBookmarkCompleted: false,
			value: props.url ? props.url : '',
			isEditing: false,
		}
	}

	onNavigate = (ev) => {
		console.log(`Omnibox::onNavigate >>>`);
		ev.preventDefault();
		this.setState({isEditing: false});
		this.prevOpen = false;
		this.setState({open: false});

		const {browser} = this.props;
		let url = this.state.value;

		if (!browser.searchService.possiblyUrl(url)) {
			url = browser.searchService.getSearchUrl(url);
		}
		this.pauseAndNavigate(url);
	}

	pauseAndNavigate = (url) => {
		this.props.browser.navigate(url);
		Spotlight.pause();
	}

	onUrlChanged = (url) => {
		this.setState({value: url});
	}

	onReloadStop = (ev) => {
		this.props.browser.reloadStop();
		Spotlight.pause();
		ev.stopPropagation();
	}

	onBookmarkAdd = () => {
		this.props.browser.addBookmark();
		this.setState({addBookmarkCompleted: true});
		setTimeout(() => {
			this.setState({addBookmarkCompleted: false});
		}, 1500);
	}

	onBookmarkRemove = () => {
		this.props.browser.removeBookmark();
		this.setState({removeBookmarkCompleted: true});
		setTimeout(() => {
			this.setState({removeBookmarkCompleted: false});
		}, 1500);
	}

	getOmniboxIcon = () => {
		const {url} = this.props;

		if (this.state.isEditing) {
			return "searchButton";
		} else if (url === 'chrome://bookmarks') {
			return "bookmarksButton";
		} else if (url === 'chrome://history') {
			return "historyButton";
		} else if (url.startsWith('https')) {
			return "secureButton";
		} else if (url === '') {
			return "searchButton";
		} else {
			return "wwwButton";
		}
	}

	onClick = (ev) => {
		ev.stopPropagation();
	}

	render () {
		const
			{isLoading, reloadDisabled, isBookmarked, browser, ...rest} = this.props,
			{addBookmarkCompleted, removeBookmarkCompleted} = this.state;

		delete rest.bookmarksData;
		delete rest.browser;
		delete rest.dispatch;
		delete rest.selectedId;
		delete rest.selectedIndex;
		delete rest.url;

		return (
			<div {...rest} className={css.div}>
				<form className={css.form} onSubmit={this.onNavigate}>
					<AddressBar browser={browser} onUrlChanged={this.onUrlChanged}/>
					<IconButton
						backgroundOpacity="transparent"
						className={css.headButton}
						type={this.getOmniboxIcon()}
					/>
					{reloadDisabled ?
						null :
						<IconButton
							backgroundOpacity="transparent"
							className={css.bookmarkButton}
							tooltipText={isBookmarked ? $L('Delete from bookmarks') : $L('Add to bookmarks')}
							onClick={isBookmarked ? this.onBookmarkRemove : this.onBookmarkAdd}
							type={isBookmarked ? "removeBookmarkButton" : "addBookmarkButton"}
						/>
					}
					<IconButton
						backgroundOpacity="transparent"
						className={css.reloadStopButton}
						tooltipText={$L('Refresh')}
						onClick={this.onReloadStop}
						disabled={reloadDisabled}
						type={isLoading ? "closeButton" : "reloadButton"}
					/>
				</form>
				<Notification
					open={addBookmarkCompleted}
					noAutoDismiss
				>
					<span>{$L('Bookmark has been added.')}</span>
				</Notification>
				<Notification
					open={removeBookmarkCompleted}
					noAutoDismiss
				>
					<span>{$L('Bookmark has been deleted.')}</span>
				</Notification>
			</div>
		);
	}
}

const mapStateToProps = ({tabsState, bookmarksState}) => {
	const {selectedIndex, ids, tabs} = tabsState;

	if (ids.length > 0) {
		const {navState, type} = tabs[ids[selectedIndex]];
		if (navState) {
			return {
				bookmarksData: bookmarksState.data,
				isBookmarked: bookmarksState.data.some(
					(bookmark) => bookmark.url === navState.url
				),
				isLoading: navState.isLoading,
				reloadDisabled: (type !== TabTypes.WEBVIEW),
				selectedId: ids[selectedIndex],
				selectedIndex,
				url: navState.url,
			}
		}
	} else {
		return {
			isLoading: true,
			reloadDisabled: true,
			url: '',
			isBookmarked: false
		};
	}
};


const Omnibox = connect(mapStateToProps, null)(OmniboxBase);

export default Omnibox;
