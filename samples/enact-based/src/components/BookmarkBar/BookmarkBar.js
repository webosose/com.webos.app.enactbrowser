/**
 * Contains the declaration for the BookmarkBar component.
 *
 */

import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Bookmark from './Bookmark';
import Sortable from '../Sortable';
import {moveBookmarkSelected} from '../../actions';

import css from './BookmarkBar.less';

const placeholder = (typeof document === 'object') ? document.createElement('li') : null;

if (placeholder) {
	placeholder.setAttribute('style', 'display: flex; width: 210px; margin-right: 21px; padding: 6px; background-color: white; opacity: 0.6; border: dotted 2px grey;');
	placeholder.innerHTML = 'drop here';
}

class BookmarkBarBase extends Component {
	static propTypes = {
		data: PropTypes.array,
		browser: PropTypes.object,
		component: PropTypes.any,
		showingBookmark: PropTypes.bool
	}

	static defaultProps = {
		showingBookmark: true
	}

	bookmarks = () => {
		const
			{component: Item, data} = this.props,
			leng = (data.length > 5) ? 5 : data.length;
		let items = [];

		for (let i = 0; i < leng; i++) {
			items.push(
				<Item
					data-id={i}
					data-index={i}
					index={i}
					key={i}
					title={data[i].title}
					url={data[i].url}
					onClick={this.onClick}
				/>
			);
		}

		return (
			<div className={css.bookmarks}>
				{items}
			</div>
		);
	}

	onClick = (ev) => {
		const
			{browser, data} = this.props,
			i = ev.currentTarget.dataset.index;

		if (!isNaN(i)) {
			const url = data[i].url;
			browser.navigate(url);
		}
	}

	onClickIcon = () => {
		this.props.browser.openBookmarks();
	}

	onMove = (fromIndex, toIndex) => {
		this.props.browser.bookmarks.moveBookmark(fromIndex, toIndex);
		this.props.moveBookmarkSelected(fromIndex, toIndex);
	}

	render = () => {
		const {showingBookmark, ...rest} = this.props;

		delete rest.component;
		delete rest.browser;

		return (
			showingBookmark ? (
				<div className={css.bookmarkBar}>
					<div className={css.bookmarkIcon} onClick={this.onClickIcon} />
					{this.bookmarks()}
				</div>
			) : null
		);
	}
}

const SortableBookmarkBar = Sortable({component: Bookmark, placeholder}, BookmarkBarBase);

const mapStateToProps = ({bookmarksState}) => ({
	data: bookmarksState.data
});

const mapDispatchToProps = (dispatch) => ({
	moveBookmarkSelected: (fromIndex, toIndex) => dispatch(moveBookmarkSelected(fromIndex, toIndex))
});

const BookmarkBar = connect(mapStateToProps, mapDispatchToProps)(SortableBookmarkBar);

export default BookmarkBar;
export {BookmarkBar, Bookmark};
