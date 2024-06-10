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
 * Contains the declaration for the History component.
 *
 */

import $L from '@enact/i18n/$L';
import Button from '@enact/agate/Button';
import {connect} from 'react-redux';
import Popup from '@enact/agate/Popup';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Component} from 'react';
import ri from '@enact/ui/resolution';
import Spotlight from '@enact/spotlight';
import VirtualList from '@enact/agate/VirtualList';

import HistoryItem from './HistoryItem';
import {selectAllHistory, deselectAllHistory} from 'js-browser-lib/redux-components/actions';

import css from './History.module.less';

class HistoryBase extends Component {

	static propTypes = {
		alwaysShowBookmarks: PropTypes.bool,
		browser: PropTypes.object,
		data: PropTypes.array,
		deselectAllHistory: PropTypes.func,
		isSelectedTab: PropTypes.bool,
		selectAllHistory: PropTypes.func,
		selected: PropTypes.array
	}

	constructor (props) {
		super(props);
		this.state = {
			completePopupOpen: false,
			deletePopupOpen: false,
			locale: window.navigator ? window.navigator.language : '',
			viewData: null
		};

		this.retrieveHistory();
	}

	componentDidMount () {
		document.addEventListener('webOSLocaleChange', this.onLocaleChange);
	}

	onLocaleChange = () => {
		console.log('[HistoryBase]::webOSLocaleChange');
		this.forceUpdate();
		setTimeout(() => {
			this.setState({
				locale: window.navigator ? window.navigator.language : '',
				viewData: this.manipulateData(this.props.data)
			});
		}, 1000);
	}

	UNSAFE_componentWillReceiveProps (nextProps) {
		if (!this.props.isSelectedTab && nextProps.isSelectedTab) {
			this.retrieveHistory();
		}
		if (this.props.data !== nextProps.data) {
			this.setState({viewData: this.manipulateData(nextProps.data)});
		}
	}

	retrieveHistory = () => {
		let now = new Date(Date.now());
		let monthAgo = new Date(now.getTime() - 2628000000);
		this.props.browser.history.retrieveByDate(monthAgo, now);
	}

	renderItem = ({index, ...rest}) => {
		const {viewData: data} = this.state;

		return (
			<HistoryItem
				{...rest}
				id={data[index].id}
				index={index}
				onClick={this.onClick}
				title={data[index].title}
				date={data[index].date}
				url={data[index].url}
				locale={this.state.locale}
			/>
		)
	}

	manipulateData = (data) => {
		if (data.length) {
			const manipulatedData = data.slice();
			const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
			const locale = window.navigator ? window.navigator.language : undefined;

			manipulatedData.unshift({
				id: 'date',
				title: data[0].date.toLocaleDateString(locale, options),
				date: data[0].date,
				url: ''
			});

			for (let i = 0; i < data.length - 1; i++) {
				if (data[i].date.toDateString() !== data[i + 1].date.toDateString()) {
					const targetIndex = manipulatedData.indexOf(data[i + 1]);
					manipulatedData.splice(targetIndex, 0, {
						id: 'date',
						title: data[i + 1].date.toLocaleDateString(locale, options),
						date: data[i + 1].date,
						url: ''
					});
				}
			}
			return manipulatedData;
		}

		return [];
	}

	onClick = (ev) => {
		const
			{browser} = this.props,
			i = ev.currentTarget.dataset.index;

		if (!isNaN(i)) {
			const url = this.state.viewData[i].url;
			browser.navigate(url);
			Spotlight.pause();
		}
	}

	onSelectAll = () => {
		const {data} = this.props;
		if (data.length === this.props.hasSelection) {
			this.props.deselectAllHistory();
		} else {
			const ids = [];
			for (let i = 0; i < data.length; i++) {
				ids.push(data[i].id);
			}
			this.props.selectAllHistory(ids);
		}
	}

	onDelete = () => {
		this.setState({deletePopupOpen: true});
	}

	onDeleteYes = () => {
		const obj = this;
		this.props.browser.history.clearByIds(
			this.props.selected,
			() => {
				obj.retrieveHistory();
				obj.setState({completePopupOpen: true});
				setTimeout(() => {
					obj.setState({completePopupOpen: false})
				}, 1500);
			}
		);
		//this.props.browser.history.clearAll();
		this.props.deselectAllHistory();
		this.setState({deletePopupOpen: false});
	}

	onDeleteNo = () => {
		this.setState({deletePopupOpen: false});
	}

	render () {
		const
			{alwaysShowBookmarks, data, hasSelection, ...rest} = this.props,
			scrollerClass = classNames(css.list, {[css.shrinkHeight]: alwaysShowBookmarks});

		delete rest.browser;
		delete rest.deselectAllHistory;
		delete rest.isSelectedTab;
		delete rest.selectAllHistory;
		delete rest.selected;

		return (
			<div className={css.history} {...rest}>
				<Button css={css} onClick={this.onSelectAll} disabled={!data.length} size={"small"}>{(data.length && data.length === hasSelection) ? $L('DESELECT ALL') : $L('SELECT ALL')}</Button>
				<Button css={css} onClick={this.onDelete} disabled={!data.length || !hasSelection} size={"small"}>{$L('Delete')}</Button>
				<Popup
					open={this.state.deletePopupOpen}
					noAutoDismiss
				>
					<span>{(data.length === hasSelection) ?
						$L('Do you want to delete all history?')
						: $L('Do you want to delete the selected history?')}</span>
					<buttons>
						<Button onClick={this.onDeleteNo}>{$L('NO')}</Button>
						<Button onClick={this.onDeleteYes}>{$L('YES')}</Button>
					</buttons>
				</Popup>
				<Popup
					open={this.state.completePopupOpen}
					noAutoDismiss
				>
					<span>{$L('Selected history has been deleted.')}</span>
				</Popup>
				{
					(this.state.viewData && this.state.viewData.length > 0) ?
						<VirtualList
							dataSize={this.state.viewData.length}
							focusableScrollbar
							itemRenderer={this.renderItem}
							className={scrollerClass}
							itemSize={ri.scale(70)}
						/>
					: <div>{$L('There is no history.')}</div>
				}
			</div>
		);
	}
}

const mapStateToProps = ({historyState, historyUIState}) => ({
	data: historyState.retrievedData,
	hasSelection: historyUIState.selected.length,
	selected: historyUIState.selected
});

const mapDispatchToProps = (dispatch) => ({
	selectAllHistory: (ids) => dispatch(selectAllHistory(ids)),
	deselectAllHistory: () => dispatch(deselectAllHistory()),
});

const History = connect(mapStateToProps, mapDispatchToProps)(HistoryBase);

export default History;
export {History};
