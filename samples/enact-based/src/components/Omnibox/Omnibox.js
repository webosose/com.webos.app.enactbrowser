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
import Input from '@enact/moonstone/Input';
import Notification from '@enact/moonstone/Notification';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Spotlight from '@enact/spotlight';

import {BrowserIconButton as IconButton} from '../BrowserIconButton';
import {TabTypes} from '../../NevaLib/BrowserModel';

import css from './Omnibox.less';

class OmniboxBase extends Component {

	static propTypes = {
		bookmarksData: PropTypes.array,
		isLoading: PropTypes.bool,
		reloadDisabled: PropTypes.bool,
		searchEngine: PropTypes.string,
		selectedId: PropTypes.string,
		selectedIndex: PropTypes.number,
		url: PropTypes.string,
		urlSuggestions: PropTypes.array
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

	prevOpen = false

	componentWillReceiveProps (nextProps) {
		if (this.props.selectedIndex !== nextProps.selectedIndex ||
			(!this.state.isEditing && !this.state.open) ||
			(this.props.url === '' && nextProps.url !== '')) {
				this.setState({isEditing: false});
				this.setState({value: nextProps.url});
		}
	}

	componentDidMount() {
		const inputElem = document.getElementById("omniboxInput");
		const inputHeight = inputElem.offsetHeight + 20;
		const borderWidth = (document.body.clientWidth / 100) * 10;  // 10% of the document width
		const width = document.body.clientWidth - borderWidth - borderWidth;
		this.props.uioverlay.setBounds(borderWidth, inputHeight, width, 50);
		this.props.uioverlay.ipc.subscribe("click_suggested_item", ({clickedIndex}) => {
			console.log(`click_suggested_item message ${clickedIndex}`);
			this.onClickSuggestedItems(clickedIndex);
		});
		this.props.uioverlay.switchContent("input_suggestion_list");
	}

	openSuggestionList(shouldOpen) {
		if (shouldOpen) {
			this.props.uioverlay.switchContent("input_suggestion_list");
		}
		this.props.uioverlay.setVisible(shouldOpen);
		this.setState({open: shouldOpen});
		console.log(`openSuggestionList setVisible(${shouldOpen})`);
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
		this.openSuggestionList(false);
		this.props.browser.navigate(url);
		Spotlight.pause();
	}

	onChange = (ev) => {
		console.log(`Omnibox::onChange >>>`);
		this.prevOpen = this.state.open;
		this.setState({iEditing: true});
		// Trick to prevent focus on popup content after opening the popup
		if (!this.prevOpen) {
			Spotlight.setPointerMode(true);
		}
		this.setState({value: ev.value, open: ev.value.length > 0});
		this.props.browser.mostVisited.getSuggestions(ev.value, 5);
	}

	componentDidUpdate(prevProps, prevState) {
		if (!this.props.urlSuggestions) {
			return;
		}

		if (!prevProps.urlSuggestions) {
			this.createAndApplySuggestionList();
			return;
		}

		if (prevState.value !== this.state.value) {
			this.createAndApplySuggestionList();
			return;
		}

		if (prevProps.urlSuggestions.length !== this.props.urlSuggestions.length) {
			this.createAndApplySuggestionList();
			return;
		}

		for (let i = 0; i < prevProps.urlSuggestions.length; i ++) {
			if (prevProps.urlSuggestions[i].url !== this.props.urlSuggestions[i].url) {
				this.createAndApplySuggestionList();
				return;
			}
		}
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

	spotSuggested = () => {
		Spotlight.focus('suggestedList');
	}

	onClickSuggestedItems = (index) => {
		this.setState({open: false});
		this.setState({isEditing: false});
		const {browser, urlSuggestions} = this.props;

		if (index === 0) {
			this.pauseAndNavigate(browser.searchService.getSearchUrl(this.state.value));
		} else {
			this.pauseAndNavigate(urlSuggestions[index - 1].url);
		}
	}

	createAndApplySuggestionList = () => {
		const
			{bookmarksData, urlSuggestions} = this.props;
		let items = [];

		items.push({
			dataIndex: 0,
			icon: "searchButton",
			title: `${this.props.searchEngine} ${$L('Search')}`,
			url: this.state.value,
			key: 0
		});

		if (urlSuggestions) {
			for (let i = 0; i < urlSuggestions.length; i ++) {
				items.push({
					dataIndex: i + 1,
					icon: bookmarksData.some(
						(bookmark) => bookmark.url === urlSuggestions[i].url
					) ? "bookmarksButton" : "historyButton",
					key: i + 1,
					onClick:this.onClickSuggestedItems,
					title: urlSuggestions[i].title,
					url: urlSuggestions[i].url
					});
			}
		}

		if (this.state.value === "") {
			this.openSuggestionList(false);
		} else {
			if (this.state.isEditing === true) {
				this.openSuggestionList(true);
			}
			this.props.uioverlay.ipc.post('suggestionList', items);
		}
		return items;
	}

	onClick = (ev) => {
		ev.stopPropagation();
	}

	onActivate = () => {
		console.log("Omnibox::Input::onActivate");
		if (this.state.value !== "") {
			this.openSuggestionList(true);
		}
		this.setState({isEditing: true});
	}

	onDeactivate = () => {
		console.log("Omnibox::Input::onDeactivate");
		this.setState({isEditing: false});
	}

	render () {
		const
			{isLoading, reloadDisabled, isBookmarked, ...rest} = this.props,
			{addBookmarkCompleted, value, open, removeBookmarkCompleted} = this.state;

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
					<Input
						id="omniboxInput"
						autoFocus={open}
						className={css.inputBox}
						dismissOnEnter
						onClick={this.onClick}
						onChange={this.onChange}
						onSpotlightDown={this.spotSuggested}
						open={open}
						value={value}
						onActivate={this.onActivate}
						onDeactivate={this.onDeactivate}
					/>
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

const mapStateToProps = ({tabsState, bookmarksState, browserState, settingsState}) => {
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
				searchEngine: settingsState.searchEngine,
				selectedId: ids[selectedIndex],
				selectedIndex,
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
