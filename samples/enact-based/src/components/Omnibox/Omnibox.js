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
import Popup from '@enact/agate/Popup';
import PropTypes from 'prop-types';
import {Component} from 'react';
import Spotlight from '@enact/spotlight';
import classNames from 'classnames';

import Icon from '@enact/agate/Icon';
import Button from '@enact/agate/Button';
import {TabTypes} from '../../NevaLib/BrowserModel';
import AddressBar from './AddressBar';

import css from './Omnibox.module.less';

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

		if (this.isEditing) {
			return "search2";
		} else if (url === 'chrome://bookmarks') {
			return "bookmark";
		} else if (url === 'chrome://history') {
			return "history";
		} else if (url.startsWith('https')) {
			return "lock";
		} else if (url === '') {
			return "search2";
		} else {
			return "browser";
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
					<Icon
						backgroundOpacity="transparent"
						className={classNames(css.searchIcon)}
						size={"large"}>
						{this.getOmniboxIcon()}
					</Icon>
					{reloadDisabled ?
						null :
						<Button
							css={css}
							backgroundOpacity="transparent"
							className={classNames(css.iconButton, css, css.small, css.bookmarkButton)}
							onClick={isBookmarked ? this.onBookmarkRemove : this.onBookmarkAdd}
							icon={isBookmarked ? 'star' : 'starhollow'}
							size={"large"}
						/>
					}
					<Button
						css={css}
						backgroundOpacity="transparent"
						className={classNames(css.iconButton, css.small, css.reloadStopButton)}
						onClick={this.onReloadStop}
						disabled={reloadDisabled}
						icon={isLoading ? 'closex' : 'refresh'}
						size={"large"}
					/>
				</form>
				<Popup
					open={addBookmarkCompleted}
					noAutoDismiss
				>
					<span>{$L('Bookmark has been added.')}</span>
				</Popup>
				<Popup
					open={removeBookmarkCompleted}
					noAutoDismiss
				>
					<span>{$L('Bookmark has been deleted.')}</span>
				</Popup>
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
