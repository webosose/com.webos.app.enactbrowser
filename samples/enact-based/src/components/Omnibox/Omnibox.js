/**
 * Contains the declaration for the Omnibox component.
 *
 */

import {connect} from 'react-redux';
import ContextualPopupDecorator from '@enact/moonstone/ContextualPopupDecorator';
import Input from '@enact/moonstone/Input';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Spotlight from '@enact/spotlight';

import {BrowserIconButton as IconButton} from '../BrowserIconButton';
import SuggestedItem from './SuggestedItem';
import {TabTypes} from '../../NevaLib/BrowserModel';

import css from './Omnibox.less';

const ContextualPopupInput = ContextualPopupDecorator(Input);

class OmniboxBase extends Component {

	static propTypes = {
		bookmarksData: PropTypes.array,
		isLoading: PropTypes.bool,
		reloadDisabled: PropTypes.bool,
		searchEngine: PropTypes.string,
		selectedIndex: PropTypes.number,
		url: PropTypes.string,
		urlSuggestions: PropTypes.array
	}

	constructor (props) {
		super(props);
		this.state = {
			open: false,
			value: props.url ? props.url : ''
		}
	}

	prevOpen = false
	isEditing = false

	onNavigate = (ev) => {
		ev.preventDefault();
		this.isEditing = false;
		this.setState({open: false});

		const {browser} = this.props;
		let url = this.state.value;

		if (!browser.searchService.possiblyUrl(url)) {
			url = browser.searchService.getSearchUrl(url);
		}
		browser.navigate(url);
	}

	onChange = (ev) => {
		this.prevOpen = this.state.open;
		this.isEditing = true;
		this.setState({value: ev.value, open: ev.value.length > 0});
		this.props.browser.mostVisited.getSuggestions(ev.value, 5);
	}

	onReloadStop = () => {
		this.props.browser.reloadStop();
	}

	onBookmarkAdd = () => {
		this.props.browser.addBookmark();
	}

	onBookmarkRemove = () => {
		this.props.browser.removeBookmark();
	}

	componentWillReceiveProps (nextProps) {
		if (this.props.selectedIndex !== nextProps.selectedIndex ||
			(!this.isEditing && !this.state.open) ||
			(this.props.url === '' && nextProps.url !== '')) {
			this.isEditing = false;
			this.setState({value: nextProps.url});
		}
	}

	componentDidUpdate () {
		if (this.prevOpen !== this.state.open) {
			setTimeout(() => {
				document.querySelector('input').focus();
			}, 0);
		}
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

	closeSuggestion = () => {
		this.setState({open: false});
	}

	spotSuggested = () => {
		Spotlight.focus('suggestedList');
	}

	setSpotlightRestrict = () => {
		Spotlight.set('suggestedList', {
			restrict: 'self-first'
		});
	}

	onClickSuggestedItems = (ev) => {
		this.setState({open: false});
		this.isEditing = false;
		const
			{browser, urlSuggestions} = this.props,
			i = ev.currentTarget.dataset.index;

		if (!isNaN(i)) {
			if (i === '0') {
				browser.navigate(browser.searchService.getSearchUrl(this.state.value));
			} else {
				browser.navigate(urlSuggestions[i - 1].url);
			}
		}
	}

	getSuggestedItems = () => {
		const
			{bookmarksData, urlSuggestions} = this.props,
			items = [];

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
		return items;
	}

	renderPopup = () => (
		<div>
			<SuggestedItem
				data-index={0}
				icon="searchButton"
				onClick={this.onClickSuggestedItems}
				onSpotlightUp={this.setSpotlightRestrict}
				title={`${this.props.searchEngine} Search`}
				url={this.state.value}
			/>
			{this.getSuggestedItems()}
		</div>
	)

	render () {
		const
			{isLoading, reloadDisabled, isBookmarked, ...rest} = this.props,
			{value, open} = this.state;

		delete rest.bookmarksData;
		delete rest.browser;
		delete rest.dispatch;
		delete rest.searchEngine;
		delete rest.selectedIndex;
		delete rest.url;
		delete rest.urlSuggestions;

		return (
			<form {...rest} className={css.form} onSubmit={this.onNavigate}>
				<ContextualPopupInput
					autoFocus
					className={css.inputBox}
					onChange={this.onChange}
					onClose={this.closeSuggestion}
					onSpotlightDown={this.spotSuggested}
					value={value}
					open={open}
					popupComponent={this.renderPopup}
					popupClassName={css.popup}
					popupSpotlightId="suggestedList"
					spotlightRestrict="self-only"
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
						tooltipText={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
						onClick={isBookmarked ? this.onBookmarkRemove : this.onBookmarkAdd}
						type={isBookmarked ? "removeBookmarkButton" : "addBookmarkButton"}
					/>
				}
				<IconButton
					backgroundOpacity="transparent"
					className={css.reloadStopButton}
					tooltipText="Refresh"
					onClick={this.onReloadStop}
					disabled={reloadDisabled}
					type={isLoading ? "closeButton" : "reloadButton"}
				/>
			</form>
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
