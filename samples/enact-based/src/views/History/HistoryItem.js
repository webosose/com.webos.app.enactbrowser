// Copyright (c) 2018 LG Electronics, Inc.
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
					<Item onClick={onClick} data-index={index} className={css.title}>{`${time.toLocaleTimeString('en-US')} ${title} - ${url}`}</Item>
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
