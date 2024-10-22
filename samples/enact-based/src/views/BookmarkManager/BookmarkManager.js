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
 * Contains the declaration for the BookmarkManager component.
 *
 */

import $L from '@enact/i18n/$L';
import Button from '@enact/agate/Button';
import {connect} from 'react-redux';
import Popup from '@enact/agate/Popup';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Component} from 'react';
import Scroller from '@enact/agate/Scroller';

import BookmarkList from './BookmarkList';
import {selectAllBookmarks, deselectAllBookmarks} from 'js-browser-lib/redux-components/actions';

import css from './BookmarkManager.module.less';

class BookmarkManagerBase extends Component {

	static propTypes = {
		alwaysShowBookmarks: PropTypes.bool,
		browser: PropTypes.object,
		data: PropTypes.array,
		selectedIndices: PropTypes.array,
		deselectAllBookmark: PropTypes.func,
		selectAllBookmark: PropTypes.func,
	}

	constructor (props) {
		super(props);
		this.state = {
			completePopupOpen: false,
			deletePopupOpen: false
		};
	}

	componentDidMount () {
		document.addEventListener('webOSLocaleChange', this.onLocaleChange);
	}

	onLocaleChange = () => {
		console.log('[BookmarkManagerBase]::webOSLocaleChange');
		this.forceUpdate();
	}

	onSelectAll = () => {
		const {data} = this.props;
		if (data.length === this.props.hasSelection) {
			this.props.deselectAllBookmarks();
		} else {
			const ids = [];
			for (let i = 0; i < data.length; i++) {
				ids.push(i);
			}
			this.props.selectAllBookmarks(ids);
		}
	}

	onDelete = () => {
		this.setState({deletePopupOpen: true});
	}

	onDeleteYes = () => {
		const {data, selectedIndices} = this.props;
		if (data.length === this.props.hasSelection) {
			this.props.browser.bookmarks.removeAllBookmarks();
		} else {
			const urls = [];
			for (let i = 0 ; i < data.length; i++) {
				if (selectedIndices.includes(i)) {
					urls.push(data[i].url);
				}
			}
			this.props.browser.bookmarks.removeBookmarks(urls);
		}

		this.props.deselectAllBookmarks();
		this.setState({completePopupOpen: true, deletePopupOpen: false});
		setTimeout(() => {
			this.setState({completePopupOpen: false})
		}, 1500);
	}

	onDeleteNo = () => {
		this.setState({deletePopupOpen: false});
	}

	render () {
		const
			{alwaysShowBookmarks, browser, data, hasSelection, ...rest} = this.props,
			scrollerClass = classNames(css.scroller, {[css.shrinkHeight]: alwaysShowBookmarks});

		delete rest.selectedIndices;
		delete rest.selectAllBookmarks;
		delete rest.deselectAllBookmarks;

		return (
			<div className={css.bookmarkManager} {...rest}>
				<Button css={css} onClick={this.onSelectAll} disabled={!data.length} size={"small"}>{(data.length && data.length === hasSelection) ? $L('Deselect All') : $L('Select All')}</Button>
				<Button css={css} onClick={this.onDelete} disabled={!data.length || !hasSelection} size={"small"}>{$L('Delete')}</Button>
				<Popup
					open={this.state.deletePopupOpen}
					noAutoDismiss
				>
					<span>{(data.length === hasSelection) ?
						$L('Do you want to delete all bookmarks?')
						: $L('Do you want to delete the selected bookmark(s)?')}</span>
					<buttons>
						<Button onClick={this.onDeleteNo}>{$L('NO')}</Button>
						<Button onClick={this.onDeleteYes}>{$L('YES')}</Button>
					</buttons>
				</Popup>
				<Popup
					open={this.state.completePopupOpen}
					noAutoDismiss
				>
					<span>{$L('Selected bookmark(s) have been deleted.')}</span>
				</Popup>
				{
					(data.length > 0) ?
					<Scroller horizontalScrollbar="hidden" className={scrollerClass}>
						<BookmarkList browser={browser}/>
					</Scroller>
					:
					<div className={css.noItem}>
						{$L('There is no bookmark.')}
					</div>
				}
			</div>
		);
	}
}

const mapStateToProps = ({bookmarksState, bookmarkUIState}) => ({
	data: bookmarksState.data,
	selectedIndices: bookmarkUIState.selected,
	hasSelection: bookmarkUIState.selected.length
});

const mapDispatchToProps = (dispatch) => ({
	selectAllBookmarks: (ids) => dispatch(selectAllBookmarks(ids)),
	deselectAllBookmarks: () => dispatch(deselectAllBookmarks())
});

const BookmarkManager = connect(mapStateToProps, mapDispatchToProps)(BookmarkManagerBase);

export default BookmarkManager;
export {BookmarkManager};
