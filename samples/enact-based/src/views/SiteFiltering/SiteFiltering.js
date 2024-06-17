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
import Icon from '@enact/agate/Icon';
import Input from '@enact/agate/Input';
import Popup from '@enact/agate/Popup';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import RadioItem from '@enact/agate/RadioItem';
import {Component} from 'react';
import Scroller from '@enact/agate/Scroller';
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
	removeApprovedSites,
	setBlockedSites,
	removeBlockedSites
} from '../../NevaLib/Settings/actions';
import PinPopup from '../../components/PinPopup';
import SiteFilteringItem from './SiteFilteringItem';

import css from './SiteFiltering.module.less';

const filteringOptions = ['off', 'whitelist', 'blacklist'];
const filteringOptionsText = [$L('Off'), $L('Approved Sites'), $L('Blocked Sites')];

function isItemApproved(option) {
	return option === filteringOptions[1];
}

class SiteFilteringBase extends Component {
	static propTypes = {
		alwaysShowBookmarks: PropTypes.bool,
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
			resetPinCodePopupOpen: false,
			urlToAdd: '',
			urlValidation: '',
		};
		this.loadSiteList();
	}

	loadSiteList () {
		const {
			siteFiltering: filteringMode,
			browser: {siteFiltering}
		} = this.props;

		if (filteringMode === filteringOptions[1]) {
			siteFiltering.getURLs(filteringMode)
				.then((values) => {
					this.props.setApprovedSites(values);
				});
		}
		else if (filteringMode === filteringOptions[2]) {
			siteFiltering.getURLs(filteringMode)
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
	}

	renderItem = ({index, ...rest}) => {
		const data = this.props.data;
		return (
			<SiteFilteringItem
				{...rest}
				index={index}
				url={data[index]}
				isApproved={isItemApproved(this.props.siteFiltering)}
			/>
		)
	}

	deselectAll = () => {
		if (isItemApproved(this.props.siteFiltering)) {
			this.props.deselectAllApprovedSites();
		} else {
			this.props.deselectAllBlockedSites();
		}
	}

	onChange = (ev) => {
		this.setState({urlToAdd: ev.value, urlValidation: ''});
	}

	onAdd = (ev) => {
		if (this.validateURL()) {
			this.addFilterPattern(this.state.urlToAdd);
			this.setState({urlToAdd: ''});
		} else {
			this.setState({urlValidation: 'Please enter valid URL.'})
		}
		ev.preventDefault();
		ev.stopPropagation();
	}

	validateURL = () => {
		const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z0-9]-*)*[a-zA-Z0-9]+)(?:\.(?:[a-zA-Z0-9]-*)*[a-zA-Z0-9]+)*(?:\.(?:[a-zA-Z]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
		return regexp.test(this.state.urlToAdd);
	}

	onSelectAll = () => {
		const
			{data, selected, siteFiltering} = this.props;
		if (data.length === selected.length) {
			this.deselectAll();
		} else {
			const ids = [];
			for (let i = 0; i < data.length; i++) {
				ids.push(i);
			}
			if (isItemApproved(siteFiltering)) {
				this.props.selectAllApprovedSites(ids);
			} else {
				this.props.selectAllBlockedSites(ids);
			}
		}
	}

	addFilterPattern = (value) => {
		const {
			siteFiltering: filteringMode,
			browser: {siteFiltering}
		} = this.props;

		siteFiltering.addURL(filteringMode, value)
			.then(() => this.loadSiteList())
			.then(() => siteFiltering.setMode(filteringMode));
	}

	removeFilterPattern = (value) => {
		const {
			siteFiltering: filteringMode,
			browser: {siteFiltering}
		} = this.props;

		siteFiltering.removeURL(filteringMode, value)
			.then(() => this.loadSiteList())
			.then(() => siteFiltering.setMode(filteringMode));
	}

	onDelete = () => {
		this.setState({deletePopupOpen: true});
	}

	onDeleteYes = () => {
		this.setState({deletePopupOpen: false});

		const {data, selected} = this.props;
		selected.forEach(i => this.removeFilterPattern(data[i]));
		this.deselectAll();
	}

	onDeleteNo = () => {
		this.setState({deletePopupOpen: false});
	}

	onOpenResetPinPopup = () => {
		this.setState({resetPinCodePopupOpen: true});
	}

	onCloseResetPinPopup = () => {
		this.setState({resetPinCodePopupOpen: false});
	}

	onSubmitPinCode = (pinCode) => {
		this.props.browser.settings.setPinCode(pinCode)
			.then(() => {
				this.setState({resetPinCodePopupOpen: false});
			});
	}

	render () {
		const
			{alwaysShowBookmarks, data, selected, siteFiltering, ...rest} = this.props,
			optionIndex = filteringOptions.indexOf(siteFiltering),
			scrollerClass = classNames(css.scroller, {[css.shrinkHeight]: alwaysShowBookmarks});

		delete rest.browser;
		delete rest.selectAllApprovedSites;
		delete rest.selectAllBlockedSites;
		delete rest.deselectAllApprovedSites;
		delete rest.deselectAllBlockedSites;
		delete rest.setApprovedSites;
		delete rest.setBlockedSites;

		return (
			<Scroller {...rest} className={scrollerClass}>
				<div className={css.siteFiltering}>
					<BodyText>Site Filtering</BodyText>
					<Group
						className={css.flex}
						childComponent={RadioItem}
						itemProps={{inline: true}}
						select="radio"
						selectedProp="selected"
						defaultSelected={optionIndex}
						onSelect={this.onSelectSiteFiltering}
					>
						{filteringOptionsText}
					</Group>
					<div>
						{$L('Approved Sites: Anyone can access only the sites on this list.')}
						<br />
						{$L('Blocked Sites: Nobody can access the sites on this list.')}
					</div>
					<br />
					{(optionIndex === 1) && <BodyText>{$L('Approved Sites List')}</BodyText>}
					{(optionIndex === 2) && <BodyText>{$L('Blocked Sites List')}</BodyText>}
					{(optionIndex === 1 || optionIndex === 2) &&
						<div>
							<Popup
								open={this.state.deletePopupOpen}
								noAutoDismiss
							>
								<span>{(data && selected && data.length === selected.length) ?
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
									<Icon className={css.add} disabled={!this.validateURL()} onClick={this.onAdd}>plus</Icon>
								</div>
								<p className={css.error}>{this.state.urlValidation}</p>
								<br/>
								<Button
									css={css}
									onClick={this.onSelectAll}
									disabled={!data || !data.length}
									size={"small"}
								>
									{(data && selected && data.length && data.length === selected.length) ? 'Deselect All' : 'Select All'}
								</Button>
								<Button
									css={css}
									onClick={this.onDelete}
									size={"small"}
									disabled={!data || !data.length || !selected.length}
								>
									Delete
								</Button>
							</form>
							{
								(data && data.length > 0) ?
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
					<Button
						css={css}
						onClick={this.onOpenResetPinPopup}
						size={"small"}
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
			</Scroller>
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
	deselectAllBlockedSites: () => dispatch(deselectAllBlockedSites()),
	removeApprovedSites: (urls) => dispatch(removeApprovedSites(urls)),
	removeBlockedSites: (urls) => dispatch(removeBlockedSites(urls))
});

const SiteFiltering = connect(mapStateToProps, mapDispatchToProps)(SiteFilteringBase);

export default SiteFiltering;
