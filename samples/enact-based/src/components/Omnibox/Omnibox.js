// Copyright (c) 2018-2019 LG Electronics, Inc.
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
import {I18nContextDecorator} from '@enact/i18n/I18nDecorator';
import Button from '@enact/moonstone/Button';
import ContextualPopupDecorator from '@enact/moonstone/ContextualPopupDecorator';
import Icon from '@enact/moonstone/Icon';
import IconButton from '@enact/moonstone/IconButton';
import {InputBase} from '@enact/moonstone/Input';
import {InputSpotlightDecorator} from '@enact/moonstone/Input/InputSpotlightDecorator';
import Notification from '@enact/moonstone/Notification';
import Skinnable from '@enact/moonstone/Skinnable';
import Spotlight from '@enact/spotlight';
import Changeable from '@enact/ui/Changeable';
import Pure from '@enact/ui/internal/Pure';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import SuggestedItem from './SuggestedItem';
import {TabTypes} from '../../NevaLib/BrowserModel';

import css from './Omnibox.module.less';

const Input = Pure(
	I18nContextDecorator(
		{rtlProp: 'rtl'},
		Changeable(
			InputSpotlightDecorator(
				{unlockedPointer: true},
				Skinnable(
					InputBase
				)
			)
		)
	)
);

const ContextualPopupInput = ContextualPopupDecorator(Input);

class OmniboxBase extends Component {

	static propTypes = {
		bookmarksData: PropTypes.array,
		isLoading: PropTypes.bool,
		reloadDisabled: PropTypes.bool,
		searchEngine: PropTypes.string,
		selectedId: PropTypes.string,
		selectedIndex: PropTypes.number,
		title: PropTypes.string,
		url: PropTypes.string,
		urlSuggestions: PropTypes.array
	}

	constructor (props) {
		super(props);
		this.state = {
			addBookmarkCompleted: false,
			addBookmarkToHome: false,
			open: false,
			removeBookmarkCompleted: false,
			value: props.url ? props.url : ''
		}
	}

	prevOpen = false
	isEditing = false
	webOSBridge = null

	componentDidMount () {
		if (typeof window !== 'undefined' && window.WebOSServiceBridge) {
			this.webOSBridge = new window.WebOSServiceBridge();
		}
	}

	componentWillReceiveProps (nextProps) {
		if (this.props.selectedIndex !== nextProps.selectedIndex ||
			(!this.isEditing && !this.state.open) ||
			(this.props.url === '' && nextProps.url !== '')) {
			this.isEditing = false;
			this.setState({value: nextProps.url});
		}
	}

	onNavigate = (ev) => {
		ev.preventDefault();
		this.isEditing = false;
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

	onChange = (ev) => {
		this.prevOpen = this.state.open;
		this.isEditing = true;
		// Trick to prevent focus on popup content after opening the popup
		if (!this.prevOpen) {
			Spotlight.setPointerMode(true);
		}
		this.setState({value: ev.value, open: ev.value.length > 0});
		this.props.browser.mostVisited.getSuggestions(ev.value, 5);
	}

	onClose = () => {
		if(Spotlight.getPointerMode()) {
			this.setState({open: false});
		}
	}

	onReloadStop = (ev) => {
		this.props.browser.reloadStop();
		Spotlight.pause();
		ev.stopPropagation();
	}

	onBookmarkAdd = () => {
		this.props.browser.addBookmark();
		this.setState({addBookmarkCompleted: true, addBookmarkToHome: false});
		setTimeout(() => {
			this.setState({addBookmarkCompleted: false});
		}, 1500);
	}

	onBookmarkAddToHome = () => {
		this.setState({addBookmarkToHome: false});

		if (this.webOSBridge) {
			this.webOSBridge.onservicecallback = (payload) => {
				console.log('Add bookmark to home result: ', payload);
			}
			this.webOSBridge.call(
				'luna://com.webos.service.applicationmanager/addLaunchPoint',
				`{"id": "com.webos.app.enactbrowser", "title": "${this.props.title}", "params": {"target": "${this.state.value}"}}`
			);
		}
	}

	onBookmarkRemove = () => {
		this.props.browser.removeBookmark();
		this.setState({removeBookmarkCompleted: true});
		setTimeout(() => {
			this.setState({removeBookmarkCompleted: false});
		}, 1500);
	}

	showAddBookmarkToHome = () => {
		this.setState({addBookmarkToHome: true});
	}

	dismissAddBookmarkToHome = () => {
		this.setState({addBookmarkToHome: false});
	}

	getOmniboxIcon = () => {
		const {url} = this.props;

		if (this.isEditing) {
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

	spotSuggested = () => {
		Spotlight.focus('suggestedList');
	}

	onClickSuggestedItems = (ev) => {
		this.setState({open: false});
		this.isEditing = false;
		const
			{browser, urlSuggestions} = this.props,
			i = ev.currentTarget.dataset.index;

		if (!isNaN(i)) {
			if (i === '0') {
				this.pauseAndNavigate(browser.searchService.getSearchUrl(this.state.value));
			} else {
				this.pauseAndNavigate(urlSuggestions[i - 1].url);
			}
		}
	}

	getSuggestedItems = () => {
		const
			{bookmarksData, urlSuggestions} = this.props,
			items = [];

		if (urlSuggestions) {
			for (let i = 0; i < urlSuggestions.length; i ++) {
				items.push(
					<SuggestedItem
						data-index={i + 1}
						icon={bookmarksData.some(
							(bookmark) => bookmark.url === urlSuggestions[i].url
						) ? "bookmarksButton" : "historyButton"}
						key={i + 1}
						onClick={this.onClickSuggestedItems}
						title={urlSuggestions[i].title}
						url={urlSuggestions[i].url}
					/>
				);
			}
		}
		return items;
	}

	renderPopup = () => (
		<div>
			<SuggestedItem
				data-index={0}
				icon="searchButton"
				onClick={this.onClickSuggestedItems}
				title={`${this.props.searchEngine} ${$L('Search')}`}
				url={this.state.value}
			/>
			{this.getSuggestedItems()}
		</div>
	)

	onClick = (ev) => {
		ev.stopPropagation();
	}

	render () {
		const
			{isLoading, reloadDisabled, isBookmarked, ...rest} = this.props,
			{addBookmarkCompleted, addBookmarkToHome, value, open, removeBookmarkCompleted} = this.state;

		delete rest.bookmarksData;
		delete rest.browser;
		delete rest.dispatch;
		delete rest.searchEngine;
		delete rest.selectedId;
		delete rest.selectedIndex;
		delete rest.url;
		delete rest.urlSuggestions;

		return (
			<div {...rest} className={css.div}>
				<form className={css.form} onSubmit={this.onNavigate}>
					<ContextualPopupInput
						autoFocus={open}
						className={css.inputBox}
						dismissOnEnter
						onClick={this.onClick}
						onChange={this.onChange}
						onClose={this.onClose}
						onSpotlightDown={this.spotSuggested}
						open={open}
						popupClassName={css.popup}
						popupComponent={this.renderPopup}
						popupSpotlightId="suggestedList"
						value={value}
					/>
					<Icon
						backgroundOpacity="transparent"
						className={classNames(css.searchIcon)}
						size="small"
					>
						search
					</Icon>
					{reloadDisabled ?
						null :
						<IconButton
							backgroundOpacity="transparent"
							className={classNames(css.iconButton, css, css.small, css.bookmarkButton)}
							tooltipText={isBookmarked ? $L('Delete from bookmarks') : $L('Add to bookmarks')}
							onClick={isBookmarked ? this.onBookmarkRemove : this.showAddBookmarkToHome}
						>
							{isBookmarked ? "star" : "hollowstar"}
						</IconButton>
					}
					<IconButton
						backgroundOpacity="transparent"
						className={classNames(css.iconButton, css.small, css.reloadStopButton)}
						onClick={this.onReloadStop}
						disabled={reloadDisabled}
						size="small"
						tooltipText={$L('Refresh')}
					>
						{isLoading ? "closex" : "refresh" }
					</IconButton>
				</form>
				<Notification
					onClose={this.dismissAddBookmarkToHome}
					open={addBookmarkToHome}
					showCloseButton
					className={css.addBookmarkToHome}
				>
					<p>{$L('You can add your bookmark to Home screen and access your favorite website by pressing the icon. Do you want to the bookmark to Home?')}</p>
					<buttons>
						<Button onClick={this.onBookmarkAdd}>{$L('NO')}</Button>
						<Button onClick={this.onBookmarkAddToHome}>{$L('YES')}</Button>
					</buttons>
				</Notification>
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

const mapStateToProps = ({tabsState, bookmarksState, browserState, settingsState}) => {
	const {selectedIndex, ids, tabs} = tabsState;

	if (ids.length > 0) {
		const {navState, title, type} = tabs[ids[selectedIndex]];
		if (navState) {
			return {
				bookmarksData: bookmarksState.data,
				isBookmarked: bookmarksState.data.some(
					(bookmark) => bookmark.url === navState.url
				),
				isLoading: navState.isLoading,
				reloadDisabled: (type !== TabTypes.WEBVIEW),
				searchEngine: settingsState.searchEngine,
				selectedId: ids[selectedIndex],
				selectedIndex,
				title,
				url: navState.url,
				urlSuggestions: browserState.urlSuggestions
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
