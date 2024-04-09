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
 * Contains the declaration for the BookmarkBar component.
 *
 */

import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Component} from 'react';
import Spotlight from '@enact/spotlight';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';

import Bookmark from './Bookmark';
import Sortable from '../Sortable';
import {moveBookmarkSelected} from 'js-browser-lib/ReduxComponents/actions';

import css from './BookmarkBar.module.less';

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
				<Draggable draggableId={`draggable-bookmark-on-bar-${i}`} index={i} key={i}>
				{provided => (
					<div
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						className={css.bookmarkContainer}
					>
						<Item
							data-id={i}
							data-index={i}
							title={data[i].title}
							url={data[i].url}
							onClick={this.onClick}
						/>
					</div>
				)}
				</Draggable>
			);
		}

		return (
			<DragDropContext onDragEnd={this.onDragEnd}>
			<Droppable droppableId='bookmarkbar' direction='horizontal'>
			{provided => (
				<div
					className={css.bookmarks}
					ref={provided.innerRef}
					{...provided.droppableProps}
				>
					{items}
					{provided.placeholder}
				</div>
			)}
			</Droppable>
			</DragDropContext>
		);
	}

	onClick = (ev) => {
		const
			{browser, data} = this.props,
			i = ev.currentTarget.dataset.index;

		if (!isNaN(i)) {
			const url = data[i].url;
			browser.navigate(url);
			Spotlight.pause();
		}
	}

	onClickIcon = () => {
		this.props.browser.openBookmarks();
	}

	onMove = (fromIndex, toIndex) => {
		this.props.browser.bookmarks.moveBookmark(fromIndex, toIndex);
		this.props.moveBookmarkSelected(fromIndex, toIndex);
	}

	onDragEnd = result => {
		const {destination, source} = result;

		if (!destination) {
			return;
		}

		if (destination.droppableId === source.droppableId && destination.index === source.index) {
			return;
		}

		this.onMove(source.index, destination.index);
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
