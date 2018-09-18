// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the SiteFiltering component.
 *
 */

import BodyText from '@enact/moonstone/BodyText';
import Button from '@enact/moonstone/Button';
import {connect} from 'react-redux';
import Group from '@enact/ui/Group';
import Icon from '@enact/moonstone/Icon';
import Input from '@enact/moonstone/Input';
import Notification from '@enact/moonstone/Notification';
import PropTypes from 'prop-types';
import RadioItem from '@enact/moonstone/RadioItem';
import React, {Component} from 'react';
import ri from '@enact/ui/resolution';
import VirtualList from '@enact/moonstone/VirtualList';

import {
	selectAllApprovedSites,
	deselectAllApprovedSites,
	selectAllBlockedSites,
	deselectAllBlockedSites
} from '../../actions';
import SiteFilteringItem from './SiteFilteringItem';

import css from './SiteFiltering.less';

const filteringOptions = ['off', 'Approved Sites', 'Blocked Sites'];

class SiteFilteringBase extends Component {
	static propTypes = {
		browser: PropTypes.any,
		data: PropTypes.array,
		selected: PropTypes.array,
		siteFiltering: PropTypes.string,
		selectAllSites: PropTypes.func,
		deselectAllSites: PropTypes.func
	}

	constructor (props) {
		super(props);
		this.state = {
			deletePopupOpen: false,
			urlToAdd: ''
		};
	}

	onSelectSiteFiltering = ({selected}) => {
		const {browser} = this.props;
		browser.settings.setSiteFiltering(filteringOptions[selected]);
	}

	renderItem = ({data, index, ...rest}) => {
		return (
			<SiteFilteringItem
				{...rest}
				index={index}
				url={data[index]}
				isApproved={this.props.siteFiltering === 'Approved Sites'}
			/>
		)
	}

	onChange = (ev) => {
		this.setState({urlToAdd: ev.value});
	}

	onAdd = (ev) => {
		ev.preventDefault();
	}

	onSelectAll = () => {
		const
			{data, selected, siteFiltering} = this.props,
			isApproved = siteFiltering === 'Approved Sites';
		if (data.length === selected.length) {
			if (isApproved) {
				this.props.deselectAllApprovedSites();
			} else {
				this.props.deselectAllBlockedSites();
			}
		} else {
			const ids = [];
			for (let i = 0; i < data.length; i++) {
				ids.push(i);
			}
			if (isApproved) {
				this.props.selectAllApprovedSites(ids);
			} else {
				this.props.selectAllBlockedSites(ids);
			}
		}
	}

	onDelete = () => {
		this.setState({deletePopupOpen: true});
	}

	onDeleteYes = () => {
		this.setState({deletePopupOpen: false});
	}

	onDeleteNo = () => {
		this.setState({deletePopupOpen: false});
	}

	render () {
		const
			{data, selected, siteFiltering, ...rest} = this.props,
			optionIndex = filteringOptions.indexOf(siteFiltering);

		delete rest.browser;
		delete rest.selectAllApprovedSites;
		delete rest.selectAllBlockedSites;
		delete rest.deselectAllApprovedSites;
		delete rest.deselectAllBlockedSites;

		return (
			<div {...rest} className={css.siteFiltering}>
				<BodyText>Site Filtering</BodyText>
				<Group
					childComponent={RadioItem}
					itemProps={{inline: true}}
					select="radio"
					selectedProp="selected"
					defaultSelected={optionIndex}
					onSelect={this.onSelectSiteFiltering}
				>
					{filteringOptions}
				</Group>
				<div>
					Approved Sites: Anyone can access the sites on this list.
					<br />
					Blocked Sites: Your Safety PIN is required to access these sites.
				</div>
				<br />
				{(optionIndex === 1) && <BodyText>Approved Sites List</BodyText>}
				{(optionIndex === 2) && <BodyText>Blocked Sites List</BodyText>}
				{(optionIndex === 1 || optionIndex === 2) &&
					<div>
						<Notification
							open={this.state.deletePopupOpen}
							noAutoDismiss
						>
							<span>{(data.length === selected.length) ?
								'Do you want to delete all websites?'
								: 'Do you want to delete the selected website(s)?'}</span>
							<buttons>
								<Button onClick={this.onDeleteNo}>No</Button>
								<Button onClick={this.onDeleteYes}>Yes</Button>
							</buttons>
						</Notification>
						<form onSubmit={this.onAdd}>
							<div className={css.inputContainer}>
								<Input
									className={css.input}
									onChange={this.onChange}
									value={this.state.urlToAdd}
								/>
								<Icon className={css.add} onClick={this.onAdd}>plus</Icon>
							</div>
							<Button
								css={css}
								onClick={this.onSelectAll}
								disabled={!data.length}
								small
							>
								{(data.length && data.length === selected.length) ? 'Deselect All' : 'Select All'}
							</Button>
							<Button
								css={css}
								onClick={this.onDelete}
								small
								disabled={!data.length || !selected.length}
							>
								Delete
							</Button>
						</form>
						{
							(data.length > 0) ?
								<VirtualList
									data={data}
									dataSize={data.length}
									itemRenderer={this.renderItem}
									className={css.list}
									itemSize={ri.scale(70)}
								/>
							: null
						}
					</div>
				}
			</div>
		);
	}
}

const mapStateToProps = ({settingsState, approvedSitesUIState, blockedSitesUIState}) => {
	const {siteFiltering} = settingsState;
	if (siteFiltering === 'Approved Sites') {
		return {
			siteFiltering,
			data: settingsState.approvedSites,
			selected: approvedSitesUIState.selected
		};
	} else if (siteFiltering === 'Blocked Sites') {
		return {
			siteFiltering,
			data: settingsState.blockedSites,
			selected: blockedSitesUIState.selected
		};
	} else if (siteFiltering === 'off') {
		return {
			siteFiltering,
			data: [],
			selected: []
		};
	}
};

const mapDispatchToProps = (dispatch) => ({
	selectAllApprovedSites: (ids) => dispatch(selectAllApprovedSites(ids)),
	deselectAllApprovedSites: () => dispatch(deselectAllApprovedSites()),
	selectAllBlockedSites: (ids) => dispatch(selectAllBlockedSites(ids)),
	deselectAllBlockedSites: () => dispatch(deselectAllBlockedSites())
});

const SiteFiltering = connect(mapStateToProps, mapDispatchToProps)(SiteFilteringBase);

export default SiteFiltering;
