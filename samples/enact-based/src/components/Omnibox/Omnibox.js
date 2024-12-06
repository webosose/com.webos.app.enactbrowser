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
 * Contains the declaration for the Omnibox component.
 *
 */

import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Component} from 'react';
import Spotlight from '@enact/spotlight';
import classNames from 'classnames';

import Icon from '@enact/agate/Icon';
import Button from '@enact/agate/Button';
import {TabTypes} from 'js-browser-lib/browser-model';
import AddressBar from './AddressBar';
import BlockedPopup from './BlockedPopup';

import css from './Omnibox.module.less';

class OmniboxBase extends Component {

	static propTypes = {
		bookmarksData: PropTypes.array,
		isLoading: PropTypes.bool,
		reloadDisabled: PropTypes.bool,
		selectedId: PropTypes.string,
		selectedIndex: PropTypes.number,
		url: PropTypes.string,
		isBlocked: PropTypes.bool,
	}

	constructor (props) {
		super(props);
		this.state = {
			isOpenBookmark: false,
			value: props.url ? props.url : '',
			isEditing: false,
		};
	}

	webOSBridge = null;
	debounce = null;

	componentDidMount() {
		if (typeof window !== 'undefined' && window.WebOSServiceBridge) {
			this.webOSBridge = new window.WebOSServiceBridge();
		}
	}

	componentDidUpdate(_, prevState) {
		if (prevState.isOpenBookmark !== this.state.isOpenBookmark) {
			if (this.state.isOpenBookmark) {
				window.document.addEventListener('click', this.hideBookmarkDialog);
			} else {
				window.document.removeEventListener('click', this.hideBookmarkDialog);
			}
		}
	}

	hideBookmarkDialog = (ev) => {
		const bookmarkIconElement = window.document.getElementById('bookmarkIcon');
		const isNonBookmarkIconClicked = !bookmarkIconElement || !bookmarkIconElement.contains(ev.target);
		if (this.state.isOpenBookmark && isNonBookmarkIconClicked) {
			this.props.bookmarkDialog.hide();
			this.setState({isOpenBookmark: false});
			clearTimeout(this.debounce);
		}
	}

	onNavigate = (ev) => {
		console.log(`Omnibox::onNavigate >>>`);
		ev.preventDefault();
		this.setState({isEditing: false});

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

	onReloadStop = () => {
		this.props.browser.reloadStop();
		Spotlight.pause();
	}

	onBookmarkAndLaunchPointAdd = ({isAddToHome}) => {
		if (isAddToHome && this.webOSBridge) {
			this.webOSBridge.call(
				'luna://com.webos.service.applicationmanager/addLaunchPoint',
				`{"id": "com.webos.app.enactbrowser", "title": "${this.props.title}", "params": {"target": "${this.props.url}"}}`
			);
		}
		this.delayHideBookmarkRemove();
	}

	onBookmarkAdd = () => {
		clearTimeout(this.debounce);
		this.props.browser.addBookmark();
		this.props.bookmarkDialog.show({addBookmarkToHome: true})
			.then(() => {
				this.setState({isOpenBookmark: true});
			});
		this.props.bookmarkDialog.ipc.ipcObject
			.on('add_bookmark_to_home', this.onBookmarkAndLaunchPointAdd);
	}

	onBookmarkRemove = () => {
		clearTimeout(this.debounce);
		this.props.browser.removeBookmark();
		this.props.bookmarkDialog.show({removeBookmarkCompleted: true})
			.then(() => {
				this.setState({isOpenBookmark: true});
				this.delayHideBookmarkRemove();
			});
	}

	delayHideBookmarkRemove = () => {
		this.debounce = setTimeout(() => {
			this.props.bookmarkDialog.hide();
			this.setState({isOpenBookmark: false});
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
		const {isLoading, reloadDisabled, isBookmarked, browser, isBlocked, ...rest} = this.props;
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
					{(isBlocked && !isLoading) &&
						<BlockedPopup browser={browser} blockedPopup={this.props.blockedPopup} />}
					{reloadDisabled ?
						null :
						<Button
							id="bookmarkIcon"
							css={css}
							backgroundOpacity="transparent"
							className={classNames(css.iconButton, css.small, css.bookmarkButton)}
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
			</div>
		);
	}
}

const mapStateToProps = ({tabsState, bookmarksState}) => {
	const {selectedIndex, ids, tabs} = tabsState;

	if (ids.length > 0) {
		const {navState, type, title, popupState} = tabs[ids[selectedIndex]];
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
				title,
				isBlocked: popupState && popupState.popupBlocked,
			}
		}
	} else {
		return {
			isLoading: true,
			reloadDisabled: true,
			url: '',
			isBookmarked: false,
			isBlocked: false,
		};
	}
};

const Omnibox = connect(mapStateToProps, null)(OmniboxBase);

export default Omnibox;
