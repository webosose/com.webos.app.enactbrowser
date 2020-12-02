// Copyright (c) 2018-2020 LG Electronics, Inc.
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

import $L from '@enact/i18n/$L';
import BodyText from '@enact/agate/BodyText';
import Button from '@enact/agate/Button';
import {connect} from 'react-redux';
import Group from '@enact/ui/Group';
// import Icon from '@enact/agate/Icon';
// import Input from '@enact/agate/Input';
// import Popup from '@enact/agate/Popup';
import PropTypes from 'prop-types';
import RadioItem from '@enact/agate/RadioItem';
import React, {Component} from 'react';
import ri from '@enact/ui/resolution';
import VirtualList from '@enact/agate/VirtualList';

import {
	selectAllApprovedSites,
	deselectAllApprovedSites,
	selectAllBlockedSites,
	deselectAllBlockedSites
} from '../../actions';
import {
	setApprovedSites,
	setBlockedSites
} from '../../NevaLib/Settings/actions';
import PinPopup from '../../components/PinPopup';
import SiteFilteringItem from './SiteFilteringItem';

import css from './SiteFiltering.module.less';

const filteringOptions = ['off', 'whitelist', 'blacklist'];
const filteringOptionsText = [$L('Off'), $L('Approved Sites'), $L('Blocked Sites')];

function isApproved (option) {
	return option === filteringOptions[1];
}

class SiteFilteringBase extends Component {
	static propTypes = {
		browser: PropTypes.any,
		data: PropTypes.array,
		deselectAllApprovedSites: PropTypes.func,
		deselectAllBlockedSites: PropTypes.func,
		deselectAllSites: PropTypes.func,
		selectAllApprovedSites: PropTypes.func,
		selectAllBlockedSites: PropTypes.func,
		selectAllSites: PropTypes.func,
		selected: PropTypes.array,
		setApprovedSites: PropTypes.func,
		setBlockedSites: PropTypes.func,
		siteFiltering: PropTypes.string
	};

	constructor (props) {
		super(props);
		this.state = {
			deletePopupOpen: false,
			resetPinCodePopupOpen: false,
			urlToAdd: ''
		};
		this.loadSiteList();
	}

	loadSiteList () {
		const {
			siteFiltering: filteringMode,
			browser: {siteFiltering: {filterStorages}}
		} = this.props;

		if (filteringMode === filteringOptions[1]) {
			filterStorages[filteringMode].getAll()
				.then((values) => {
					this.props.setApprovedSites(values);
				});
		} else if (filteringMode === filteringOptions[2]) {
			filterStorages[filteringMode].getAll()
				.then((values) => {
					this.props.setBlockedSites(values);
				});
		}
	}

	onSelectSiteFiltering = ({selected}) => {
		const
			{browser: {settings, siteFiltering}} = this.props,
			newMode = filteringOptions[selected];

		settings.setSiteFiltering(newMode)
			.then(() => siteFiltering.setMode(newMode))
			.then(() => this.loadSiteList());
	};

	renderItem = ({index, ...rest}) => {
		const data = this.props.data;
		return (
			<SiteFilteringItem
				{...rest}
				index={index}
				url={data[index]}
				isApproved={isApproved(this.props.siteFiltering)}
			/>
		);
	};

	onChange = (ev) => {
		this.setState({urlToAdd: ev.value});
	};

	onAdd = (ev) => {
		ev.preventDefault();
	};

	onSelectAll = () => {
		const
			{data, selected, siteFiltering} = this.props,
			approved = isApproved(siteFiltering);
		if (data.length === selected.length) {
			if (approved) {
				this.props.deselectAllApprovedSites();
			} else {
				this.props.deselectAllBlockedSites();
			}
		} else {
			const ids = [];
			for (let i = 0; i < data.length; i++) {
				ids.push(i);
			}
			if (approved) {
				this.props.selectAllApprovedSites(ids);
			} else {
				this.props.selectAllBlockedSites(ids);
			}
		}
	};

	onDelete = () => {
		this.setState({deletePopupOpen: true});
	};

	onDeleteYes = () => {
		this.setState({deletePopupOpen: false});
	};

	onDeleteNo = () => {
		this.setState({deletePopupOpen: false});
	};

	onOpenResetPinPopup = () => {
		this.setState({resetPinCodePopupOpen: true});
	};

	onCloseResetPinPopup = () => {
		this.setState({resetPinCodePopupOpen: false});
	};

	onSubmitPinCode = (pinCode) => {
		this.props.browser.settings.setPinCode(pinCode)
			.then(() => {
				this.setState({resetPinCodePopupOpen: false});
			});
	};

	render () {
		const
			{data, siteFiltering, ...rest} = this.props,
			optionIndex = filteringOptions.indexOf(siteFiltering);

		delete rest.browser;
		delete rest.selectAllApprovedSites;
		delete rest.selectAllBlockedSites;
		delete rest.deselectAllApprovedSites;
		delete rest.deselectAllBlockedSites;
		delete rest.setApprovedSites;
		delete rest.setBlockedSites;

		return (
			<div {...rest} className={css.siteFiltering}>
				<BodyText>Site Filtering</BodyText>
				<Group
					childComponent={RadioItem}
					itemProps={{inline: true, className: css.inlineGroupItem}}
					select="radio"
					selectedProp="selected"
					defaultSelected={optionIndex}
					onSelect={this.onSelectSiteFiltering}
				>
					{filteringOptionsText}
				</Group>
				<div>
					{$L('Approved Sites: Anyone can access the sites on this list.')}
					<br />
					{$L('Blocked Sites: Your Safety PIN is required to access these sites.')}
				</div>
				<br />
				{(optionIndex === 1) && <BodyText>{$L('Approved Sites List')}</BodyText>}
				{(optionIndex === 2) && <BodyText>{$L('Blocked Sites List')}</BodyText>}
				{(optionIndex === 1 || optionIndex === 2) &&
					<div>
						{/*
						<Popup
							centered
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
						</Popup>
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
								size="small"
							>
								{(data.length && data.length === selected.length) ? 'Deselect All' : 'Select All'}
							</Button>
							<Button
								css={css}
								onClick={this.onDelete}
								size="small"
								disabled={!data.length || !selected.length}
							>
								Delete
							</Button>
						</form>
						*/}
						{
							(data.length > 0) ?
								<VirtualList
									data={data}
									dataSize={data.length}
									itemRenderer={this.renderItem}
									className={css.list}
									itemSize={ri.scale(70)}
								/> :
								null
						}
					</div>
				}
				<Button
					css={css}
					onClick={this.onOpenResetPinPopup}
					size="small"
				>
					{$L('Reset pin')}
				</Button>
				<PinPopup
					open={this.state.resetPinCodePopupOpen}
					onClose={this.onCloseResetPinPopup}
					onSubmit={this.onSubmitPinCode}
					matched
				/>
			</div>
		);
	}
}

const mapStateToProps = ({settingsState, approvedSitesUIState, blockedSitesUIState}) => {
	const {siteFiltering} = settingsState;
	if (siteFiltering === filteringOptions[1]) {
		return {
			siteFiltering,
			data: settingsState.approvedSites,
			selected: approvedSitesUIState.selected
		};
	} else if (siteFiltering === filteringOptions[2]) {
		return {
			siteFiltering,
			data: settingsState.blockedSites,
			selected: blockedSitesUIState.selected
		};
	} else if (siteFiltering === filteringOptions[0]) {
		return {
			siteFiltering,
			data: [],
			selected: []
		};
	}
};

const mapDispatchToProps = (dispatch) => ({
	setApprovedSites: (urls) => dispatch(setApprovedSites(urls)),
	selectAllApprovedSites: (ids) => dispatch(selectAllApprovedSites(ids)),
	deselectAllApprovedSites: () => dispatch(deselectAllApprovedSites()),
	setBlockedSites: (urls) => dispatch(setBlockedSites(urls)),
	selectAllBlockedSites: (ids) => dispatch(selectAllBlockedSites(ids)),
	deselectAllBlockedSites: () => dispatch(deselectAllBlockedSites())
});

const SiteFiltering = connect(mapStateToProps, mapDispatchToProps)(SiteFilteringBase);

export default SiteFiltering;
