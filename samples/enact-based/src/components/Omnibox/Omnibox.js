// Copyright (c) 2018-2020 LG Electronics, Inc.
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

import { is } from '@enact/core/keymap';
import classNames from 'classnames';
import Button from '@enact/agate/Button';
import ContextualPopupDecorator from '@enact/agate/ContextualPopupDecorator';
import Icon from '@enact/agate/Icon';
import { InputBase } from '@enact/agate/Input';
import { InputSpotlightDecorator } from '@enact/agate/Input/InputSpotlightDecorator';
import Popup from '@enact/agate/Popup';
import Skinnable from '@enact/agate/Skinnable';
import $L from '@enact/i18n/$L';
import { I18nContextDecorator } from '@enact/i18n/I18nDecorator';
import Spotlight from '@enact/spotlight';
import Changeable from '@enact/ui/Changeable';
import Pure from '@enact/ui/internal/Pure';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import TooltipDecorator from '@enact/agate/TooltipDecorator';

import SuggestedItem from './SuggestedItem';
import { TabTypes } from '../../NevaLib/BrowserModel';

import css from './Omnibox.module.less';
import PopupComponent from '../../components/Popup/Popup';
import kind from "@enact/core/kind";
import { set_allow_media_popup } from '../../NevaLib/Popup/actions';


const Input = Pure(
	I18nContextDecorator(
		{ rtlProp: 'rtl' },
		Changeable(
			InputSpotlightDecorator(
				{ noLockPointer: true },
				Skinnable(
					InputBase
				)
			)
		)
	)
);

const ContextualPopupInput = ContextualPopupDecorator({ noArrow: true }, Input);
const TooltipButton = TooltipDecorator({ tooltipDestinationProp: 'decoration' }, Button);


const emptyButton = kind({
	name: 'emptyButton',
	render: () => (
		<div></div>
	)
});

const MediaPermissionPopupButton = ContextualPopupDecorator(emptyButton);


class OmniboxBase extends Component {

	static propTypes = {
		bookmarksData: PropTypes.array,
		browser: PropTypes.object,
		isBookmarked: PropTypes.bool,
		isLoading: PropTypes.bool,
		reloadDisabled: PropTypes.bool,
		searchEngine: PropTypes.string,
		selectedId: PropTypes.string,
		selectedIndex: PropTypes.number,
		title: PropTypes.string,
		url: PropTypes.string,
		urlSuggestions: PropTypes.array
	};

	constructor(props) {
		super(props);
		this.state = {
			addBookmarkCompleted: false,
			addBookmarkToHome: false,
			open: false,
			removeBookmarkCompleted: false,
			value: props.url ? props.url : '',
		};
	}

	componentDidMount() {
		if (typeof window !== 'undefined') {
			if (window.WebOSServiceBridge)
				this.webOSBridge = new window.WebOSServiceBridge();

			window.addEventListener("message", (ev) => {
				if (ev.data && ev.data.event === 'click' && ev.data.rootUrl === ev.origin && this.state.open)
					this.setState({ open: false })
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.selectedIndex !== nextProps.selectedIndex ||
			(!this.isEditing && !this.state.open) ||
			(this.props.url === '' && nextProps.url !== '')) {
			this.isEditing = false;
			this.setState({ value: nextProps.url });
		}
	}

	prevOpen = false;
	isEditing = false;
	webOSBridge = null;

	onNavigate = (ev) => {
		ev.preventDefault();
		this.isEditing = false;
		this.prevOpen = false;
		this.setState({ open: false });

		const { browser } = this.props;
		let url = this.state.value;

		if (!browser.searchService.possiblyUrl(url)) {
			url = browser.searchService.getSearchUrl(url);
		}
		this.pauseAndNavigate(url);

	};

	pauseAndNavigate = (url) => {
		this.props.browser.navigate(url);
		Spotlight.pause();
	};

	onChange = (ev) => {
		this.prevOpen = this.state.open;
		this.isEditing = true;
		// Trick to prevent focus on popup content after opening the popup
		if (!this.prevOpen) {
			Spotlight.setPointerMode(true);
			Spotlight.pause();
		}

		this.setState({
			value: ev.value,
			open: true
		});

		this.props.browser.mostVisited.getSuggestions(ev.value, 5);
	};

	onKeyDown = (ev) => {
		const
			{ keyCode, target } = ev,
			{ value, selectionStart, tagName } = target;

		if (tagName.toUpperCase() === 'INPUT') {
			const
				isLeft = is('left', keyCode),
				isRight = is('right', keyCode),
				xSpotlightMove = (isLeft && selectionStart === 0) || (isRight && selectionStart === value.length);

			if (xSpotlightMove && Spotlight.isPaused()) {
				Spotlight.resume();
				this.setState({ open: false });
			}
		}
	};

	onClose = () => {
		if (Spotlight.getPointerMode()) {
			this.setState({ open: false });
		}
	};

	onReloadStop = (ev) => {
		this.props.browser.reloadStop();
		Spotlight.pause();
		ev.stopPropagation();
	};

	onBookmarkAdd = () => {
		this.props.browser.addBookmark();
		this.setState({ addBookmarkCompleted: true, addBookmarkToHome: false });
		setTimeout(() => {
			this.setState({ addBookmarkCompleted: false });
		}, 1500);
	};

	onBookmarkAndLaunchPointAdd = () => {
		if (this.webOSBridge) {
			this.webOSBridge.onservicecallback = (payload) => {
				console.log('Add bookmark to home result: ', payload); // eslint-disable-line no-console
			};
			this.webOSBridge.call(
				'luna://com.webos.service.applicationmanager/addLaunchPoint',
				`{"id": "com.webos.app.enactbrowser", "title": "${this.props.title}", "params": {"target": "${this.state.value}"}}`
			);
		}

		this.onBookmarkAdd();
	};

	onBookmarkRemove = () => {
		this.props.browser.removeBookmark();
		this.setState({ removeBookmarkCompleted: true });
		setTimeout(() => {
			this.setState({ removeBookmarkCompleted: false });
		}, 1500);
	};

	showAddBookmarkToHome = () => {
		this.setState({ addBookmarkToHome: true });
	};

	dismissAddBookmarkToHome = () => {
		this.setState({ addBookmarkToHome: false });
	};

	getOmniboxIcon = () => {
		const { url } = this.props;

		if (this.isEditing) {
			return 'search2';
		} else if (url === 'chrome://bookmarks') {
			return 'bookmark';
		} else if (url === 'chrome://history') {
			return 'history';
		} else if (url.startsWith('https')) {
			return 'lock';
		} else if (url === '') {
			return 'search2';
		} else {
			return 'browser';
		}
	};

	spotSuggested = () => {
		Spotlight.focus('suggestedList');
	};

	onClickSuggestedItems = (ev) => {
		this.setState({ open: false });
		this.isEditing = false;
		const
			{ browser, urlSuggestions } = this.props,
			i = ev.currentTarget.dataset.index;

		if (!isNaN(i)) {
			if (i === '0') {
				this.pauseAndNavigate(browser.searchService.getSearchUrl(this.state.value));
			} else {
				this.pauseAndNavigate(urlSuggestions[i - 1].url);
			}
		}
	};

	getSuggestedItems = () => {
		const
			{ bookmarksData, urlSuggestions } = this.props,
			items = [];

		if (urlSuggestions) {
			for (let i = 0; i < urlSuggestions.length; i++) {
				items.push(
					<SuggestedItem
						data-index={i + 1}
						icon={bookmarksData.some(
							(bookmark) => bookmark.url === urlSuggestions[i].url
						) ? 'bookmark' : 'history'}
						key={i + 1}
						onClick={this.onClickSuggestedItems}
						title={urlSuggestions[i].title}
						url={urlSuggestions[i].url}
					/>
				);
			}
		}
		return items;
	};

	renderPopup = () => (
		<div>
			<SuggestedItem
				data-index={0}
				icon="search2"
				onClick={this.onClickSuggestedItems}
				title={`${this.props.searchEngine} ${$L('Search')}`}
				url={this.state.value}
			/>
			{this.getSuggestedItems()}
		</div>
	);

	renderMediaPopup = () => (
		<>
			<PopupComponent domain={this.props.domain} detectedMedia={this.props.detectedMedia} />
		</>
	);

	onClick = (ev) => {
		ev.stopPropagation();
	};

	//Responsible for popUp close action while switching tabs etc..
	handleClose = () => {
		console.log("HANDLE_CLOSE function entered - Omnibox.js")
		// console.log("window is ===> ", window.navigator,"type is ===> ",typeof(window))
		// console.log("window is ===> ", window.navigator.userpermission)
		// let result = window.navigator.userpermission.onpromptresponse(3)  //sending close response
		// console.log("API is called - Omnibox.js.Result is ===> ",result)
		this.props.set_allow_media_popup(false)  //manually closing the  popup
		console.log("Closed - Omnibox.js")
	}

	render() {
		const
			{ isLoading, reloadDisabled, isBookmarked, allow_media_popup, ...rest } = this.props,
			{ addBookmarkCompleted, addBookmarkToHome, value, open, removeBookmarkCompleted } = this.state,
			popupClassName = classNames(css.popup, { [css.invisible]: (open && !value.length) });

		var url_value = value;
		if (value.includes('viewer.html?pdf_url=')) {
			url_value = value.split("pdf_url=")[1];
		}
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
				<MediaPermissionPopupButton  			//Media Permission Popup that is shown to ask for media permissions
					css={css}
					autoFocus={allow_media_popup}
					onClose={this.handleClose}
					open={allow_media_popup}
					popupClassName={css.mediaPopup}
					popupComponent={this.renderMediaPopup}
					direction="below left"
					noArrow={false}
				/>
				<form className={css.form} onSubmit={this.onNavigate}>
					<ContextualPopupInput
						autoFocus={open}
						className={css.inputBox}
						css={css}
						dismissOnEnter
						onClick={this.onClick}
						onChange={this.onChange}
						onClose={this.onClose}
						onKeyDown={this.onKeyDown}
						onSpotlightDown={this.spotSuggested}
						open={open}
						popupClassName={popupClassName}
						popupComponent={this.renderPopup}
						popupSpotlightId="suggestedList"
						showCloseButton
						value={url_value}
					/>

					<Icon
						className={classNames(css.searchIcon)}
						size="small"
					>
						search2
					</Icon>
					{reloadDisabled ?
						null :
						<TooltipButton
							backgroundOpacity="transparent"
							className={classNames(css.iconButton, css, css.small, css.bookmarkButton)}
							css={css}
							icon={isBookmarked ? 'star' : 'starhollow'}
							size="small"
							tooltipText={isBookmarked ? $L('Delete from bookmarks') : $L('Add to bookmarks')}
							onClick={isBookmarked ? this.onBookmarkRemove : this.showAddBookmarkToHome}
						/>
					}
					<TooltipButton
						backgroundOpacity="transparent"
						className={classNames(css.iconButton, css.small, css.reloadStopButton)}
						css={css}
						onClick={this.onReloadStop}
						disabled={reloadDisabled}
						icon={isLoading ? 'closex' : 'refresh'}
						size="small"
						tooltipText={$L('Refresh')}
					/>
				</form>
				<Popup
					centered
					onClose={this.dismissAddBookmarkToHome}
					open={addBookmarkToHome}
					showCloseButton
					className={css.addBookmarkToHome}
				>
					<p>{$L('You can add your bookmark to Home screen and access your favorite website by pressing the icon. Do you want to add the bookmark to Home?')}</p>
					<buttons>
						<Button onClick={this.onBookmarkAdd} size="small">{$L('NO')}</Button>
						<Button onClick={this.onBookmarkAndLaunchPointAdd} size="small">{$L('YES')}</Button>
					</buttons>
				</Popup>
				<Popup
					centered
					open={addBookmarkCompleted}
					noAutoDismiss
				>
					<span>{$L('Bookmark has been added.')}</span>
				</Popup>
				<Popup
					centered
					open={removeBookmarkCompleted}
					noAutoDismiss
				>
					<span>{$L('Bookmark has been deleted.')}</span>
				</Popup>
			</div>
		);
	}
}

const mapStateToProps = ({ tabsState, bookmarksState, browserState, settingsState, popupState }) => {
	const { selectedIndex, ids, tabs } = tabsState;
	
	if (ids.length > 0) {
		const { navState, title, type } = tabs[ids[selectedIndex]];
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
				urlSuggestions: browserState.urlSuggestions,
				allow_media_popup: popupState.allow_media_popup
			};
		}
	} else {
		return {
			isLoading: true,
			reloadDisabled: true,
			url: '',
			isBookmarked: false,
			allow_media_popup: popupState.allow_media_popup
		};
	}
};

const mapDispatchToProps = (dispatch) => ({
	set_allow_media_popup: (data) => dispatch(set_allow_media_popup(data))
});

const Omnibox = connect(mapStateToProps, mapDispatchToProps)(OmniboxBase);

export default Omnibox;
