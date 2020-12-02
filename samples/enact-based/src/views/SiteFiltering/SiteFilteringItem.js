// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the SiteFilteringItem component.
 *
 */

import {connect} from 'react-redux';
import CheckboxItem from '@enact/agate/CheckboxItem';

import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {selectApprovedSite, selectBlockedSite} from '../../actions';

import css from './SiteFilteringItem.module.less';

class SiteFilteringItemBase extends Component {
	static propTypes = {
		index: PropTypes.number,
		isApproved: PropTypes.bool,
		onToggle: PropTypes.func,
		selected: PropTypes.bool,
		url: PropTypes.string
	};

	onToggle = (ev) => {
		this.props.onToggle(this.props.index, ev.selected);
	};

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
