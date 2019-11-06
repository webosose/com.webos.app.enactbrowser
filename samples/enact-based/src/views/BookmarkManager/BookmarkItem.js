// Copyright (c) 2018-2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the BookmarkItem component.
 *
 */

import {connect} from 'react-redux';
import Checkbox from '@enact/moonstone/Checkbox';
import Item from '@enact/moonstone/Item';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {selectBookmark} from '../../actions';

import css from './BookmarkItem.module.less';

class BookmarkItemBase extends Component {
	static propTypes = {
		index: PropTypes.number,
		onClick: PropTypes.func,
		selected: PropTypes.bool,
		title: PropTypes.string,
		toggleBookmark: PropTypes.func,
		url: PropTypes.string
	}

	onToggle = (ev) => {
		this.props.toggleBookmark(this.props.index, ev.selected);
	}

	render () {
		const {index, selected, title, onClick, url, ...rest} = this.props;
		delete rest.toggleBookmark;

		return (
			<div {...rest} className={css.bookmarkItem}>
				<Checkbox className={css.checkbox} onToggle={this.onToggle} selected={selected} />
				<div className={css.favicon} />
				<Item onClick={onClick} data-index={index} className={css.title}>{`${title} - ${url}`}</Item>
			</div>
		);
	}
}

const mapStateToProps = ({bookmarkUIState}, {index}) => ({
	selected: bookmarkUIState.selected.includes(index)
});

const mapDispatchToProps = (dispatch) => ({
	toggleBookmark: (index, selected) => dispatch(selectBookmark(index, selected))
});

const BookmarkItem = connect(mapStateToProps, mapDispatchToProps)(BookmarkItemBase);

export default BookmarkItem;
export {BookmarkItem};
