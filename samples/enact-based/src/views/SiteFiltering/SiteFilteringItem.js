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
 * Contains the declaration for the SiteFilteringItem component.
 *
 */

import {connect} from 'react-redux';
import CheckboxItem from '@enact/moonstone/CheckboxItem';

import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {selectApprovedSite, selectBlockedSite} from '../../actions';

import css from './SiteFilteringItem.less';

class SiteFilteringItemBase extends Component {
	static propTypes = {
		isApproved: PropTypes.bool,
		index: PropTypes.number,
		onToggle: PropTypes.func,
		selected: PropTypes.bool,
		url: PropTypes.string
	}

	onToggle = (ev) => {
		this.props.onToggle(this.props.index, ev.selected);
	}

	render () {
		const {selected, url, ...rest} = this.props;
		delete rest.index;
		delete rest.isApproved;

		return (
			<CheckboxItem
				{...rest}
				className={css.item}
				onToggle={this.onToggle}
				selected={selected}
			>
				{url}
			</CheckboxItem>
		);
	}
}

const mapStateToProps = ({approvedSitesUIState, blockedSitesUIState}, {isApproved, index}) => ({
	selected: isApproved ? approvedSitesUIState.selected.includes(index) :
							blockedSitesUIState.selected.includes(index)
});

const mapDispatchToProps = (dispatch, {isApproved}) => ({
	onToggle: (index, selected) => dispatch(isApproved ? selectApprovedSite(index, selected) : selectBlockedSite(index, selected))
});

const SiteFilteringItem = connect(mapStateToProps, mapDispatchToProps)(SiteFilteringItemBase);

export default SiteFilteringItem;
export {SiteFilteringItem};
