// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the HistoryItem component.
 *
 */

import {connect} from 'react-redux';
import Checkbox from '@enact/moonstone/Checkbox';
import Item from '@enact/moonstone/Item';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {selectHistory} from '../../actions';

import css from './HistoryItem.less';

class HistoryItemBase extends Component {
	static propTypes = {
		index: PropTypes.number,
		id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		onClick: PropTypes.func,
		selected: PropTypes.bool,
		time: PropTypes.object,
		title: PropTypes.string,
		toggleHistory: PropTypes.func,
		url: PropTypes.string
	}

	onToggle = (ev) => {
		this.props.toggleHistory(this.props.id, ev.selected);
	}

	render () {
		const {index, id, selected, title, onClick, url, time, ...rest} = this.props;
		delete rest.toggleHistory;

		if (id !== 'date') {
			return (
				<div {...rest} className={css.historyItem}>
					<Checkbox className={css.checkbox} onToggle={this.onToggle} selected={selected} />
					<Item onClick={onClick} data-index={index} className={css.title}>{`${time.toLocaleTimeString(window.navigator ? window.navigator.language : undefined)} ${title} - ${url}`}</Item>
				</div>
			);
		} else {
			const
				now = new Date(),
				content = (now.toDateString() === title) ? title + ' (Today)' : title;
			return (
				<div {...rest} className={css.historyItem}>
					<Item data-index={index} className={css.date}>{content}</Item>
				</div>
			);
		}
	}
}

const mapStateToProps = ({historyUIState}, {id}) => ({
	selected: historyUIState.selected.includes(id)
});

const mapDispatchToProps = (dispatch) => ({
	toggleHistory: (id, selected) => dispatch(selectHistory(id, selected))
});

const HistoryItem = connect(mapStateToProps, mapDispatchToProps)(HistoryItemBase);

export default HistoryItem;
export {HistoryItem};
