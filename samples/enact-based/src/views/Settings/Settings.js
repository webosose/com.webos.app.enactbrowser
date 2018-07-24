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
 * Contains the declaration for the Settings component.
 *
 */

import BodyText from '@enact/moonstone/BodyText';
import Button from '@enact/moonstone/Button';
import {connect} from 'react-redux';
import classNames from 'classnames';
import ExpandableInput from '@enact/moonstone/ExpandableInput';
import Group from '@enact/ui/Group';
import kind from '@enact/core/kind';
import Notification from '@enact/moonstone/Notification';
import PropTypes from 'prop-types';
import RadioItem from '@enact/moonstone/RadioItem';
import React, {Component} from 'react';
import Scroller from '@enact/moonstone/Scroller';
import ToggleButton from '@enact/moonstone/ToggleButton';

import css from './Settings.less';

const OnOffButton = kind({
	name: 'OnOffButton',
	render: (props) => {
		return (
			<ToggleButton
				toggleOffLabel='Off'
				toggleOnLabel='On'
				small
				{...props}
			/>
		);
	}
});

const
	startupOptions = ['newTabPage', 'continue', 'homePage'],
	searchEngines = ['Google', 'Yahoo!', 'Bing'];

class SettingsBase extends Component {
	static propTypes = {
		alwaysShowBookmarks: PropTypes.bool,
		browser: PropTypes.any,
		startupPage: PropTypes.string,
		homePageUrl: PropTypes.string,
		searchEngine: PropTypes.string,
		privateBrowsing: PropTypes.bool,
		siteFiltering: PropTypes.string
	}

	constructor (props) {
		super(props);
		this.state = {
			value: props.homePageUrl,
			siteFilteringOpen: false,
			clearPopupOpen: false,
			clearing: false,
			matchedPin: 'yet'
		}
	}

	onChange = (ev) => {
		this.setState({value: ev.value});
	}

	onClose = () => {
		const {browser} = this.props;
		browser.settings.setHomePageUrl(this.state.value);
	}

	onToggleShowBookmarks = () => {
		const {browser, alwaysShowBookmarks} = this.props;
		browser.settings.setAlwaysShowBookmarks(!alwaysShowBookmarks);
	}

	onSelectStartupOption = ({selected}) => {
		const {browser} = this.props;
		browser.settings.setStartupPage(startupOptions[selected]);
	}

	onSelectSearchEngine = ({selected}) => {
		const {browser} = this.props;
		browser.settings.setSearchEngine(searchEngines[selected]);
	}

	onTogglePrivateBrowsing = () => {
		const {browser, privateBrowsing} = this.props;
		browser.settings.setPrivateBrowsing(!privateBrowsing);
	}

	onClearBrowsingData = () => {
		this.setState({clearPopupOpen: true});
	}

	onClearYes = () => {
		const {browser} = this.props;

		this.setState({clearing: true});
		Promise.race([
			browser.clearData(),
			new Promise((resolve) => {
				setTimeout(resolve, 3000);
			})
		]).then(
			this.setState({clearPopupOpen: false, clearing: false}),
			this.setState({clearPopupOpen: false, clearing: false})
		);
	}

	onClearNo = () => {
		this.setState({clearPopupOpen: false});
	}

	startSiteFiltering = () => {
		this.setState({siteFilteringOpen: true});
	}

	onSubmitPinCode = (pinCode) => {
		const {browser} = this.props;
		if (browser.settings.matchPinCode(pinCode)) {
			this.setState({matchedPin: 'correct'});
			browser.openSiteFiltering();
		} else {
			this.setState({matchedPin: 'incorrect'});
		}
	}

	onClosePinPopup = () => {
		this.setState({siteFilteringOpen: false, matchedPin: 'yet'});
	}

	render () {
		const
			{
				className,
				startupPage,
				searchEngine,
				alwaysShowBookmarks,
				...rest
			} = this.props,
			classes = classNames(className, css.settings),
			startupOption = startupOptions.indexOf(startupPage);

		delete rest.browser;
		delete rest.dispatch;
		delete rest.homePageUrl;
		delete rest.privateBrowsing;
		delete rest.siteFiltering;

		return (
			<Scroller {...rest} className={css.scroller}>
				<div className={classes}>
					<BodyText>On Startup</BodyText>
					<div className={css.indent}>
						<Group
							childComponent={RadioItem}
							itemProps={{inline: false}}
							select="radio"
							selectedProp="selected"
							defaultSelected={startupOption}
							onSelect={this.onSelectStartupOption}
						>
							{[
								'Open the New Tab page',
								'Continue where I left off',
								'Home page'
							]}
						</Group>
						<ExpandableInput
							disabled={(startupOption !== 2)}
							title="Home page url"
							value={this.state.value}
							onChange={this.onChange}
							onClose={this.onClose}
						/>
					</div>

					<BodyText>Search engine</BodyText>
					<div className={css.indent}>
						<Group
							childComponent={RadioItem}
							itemProps={{inline: true}}
							select="radio"
							selectedProp="selected"
							defaultSelected={searchEngines.indexOf(searchEngine)}
							onSelect={this.onSelectSearchEngine}
						>
							{searchEngines}
						</Group>
					</div>
					<BodyText className={css.menu}>Always Show Bookmarks Bar</BodyText>
					<OnOffButton onClick={this.onToggleShowBookmarks} selected={alwaysShowBookmarks} />
					<br />

					{/*<BodyText className={css.menu}>Private Browsing</BodyText>
					<OnOffButton onClick={this.onTogglePrivateBrowsing} selected={privateBrowsing} />
					<br />*/}

					{/*<BodyText className={css.menu}>Site Filtering</BodyText>
					<OnOffButton onClick={this.startSiteFiltering} selected={(siteFiltering !== 'off')} />
					<br />*/}

					<Notification
						open={this.state.clearPopupOpen}
						noAutoDismiss
					>
						{this.state.clearing ?
							<span>{'Clearing all browsing data...'}</span>
							:
							<span>{'Do you want to clear all browsing data?'}</span>
						}
						{this.state.clearing ?
							null :
							<buttons>
								<Button onClick={this.onClearNo}>No</Button>
								<Button onClick={this.onClearYes}>Yes</Button>
							</buttons>
						}
					</Notification>

					<Button onClick={this.onClearBrowsingData} css={css} small>Clear browsing data</Button>

					{/*<PinPopup open={siteFilteringOpen} onClose={this.onClosePinPopup} onSubmit={this.onSubmitPinCode} matched={matchedPin} />*/}
				</div>
			</Scroller>
		);
	}

}

const mapStateToProps = ({settingsState}) => ({
	startupPage: settingsState.startupPage,
	alwaysShowBookmarks: settingsState.alwaysShowBookmarks,
	homePageUrl: settingsState.homePageUrl,
	searchEngine: settingsState.searchEngine,
	privateBrowsing: settingsState.privateBrowsing,
	siteFiltering: settingsState.siteFiltering
});

const Settings = connect(mapStateToProps, null)(SettingsBase);

export default Settings;
