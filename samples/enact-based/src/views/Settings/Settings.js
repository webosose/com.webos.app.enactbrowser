// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the Settings component.
 *
 */

import BodyText from '@enact/agate/BodyText';
import Button from '@enact/agate/Button';
import Input from '@enact/agate/Input';
import Popup from '@enact/agate/Popup';
import RadioItem from '@enact/agate/RadioItem';
import Scroller from '@enact/agate/Scroller';
import ToggleButton from '@enact/agate/ToggleButton';
import kind from '@enact/core/kind';
import $L from '@enact/i18n/$L';
import Group from '@enact/ui/Group';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import PinPopup from '../../components/PinPopup';

import css from './Settings.module.less';

const OnOffButton = kind({
	name: 'OnOffButton',
	render: (props) => {
		return (
			<ToggleButton
				toggleOffLabel={$L('Off')}
				toggleOnLabel={$L('On')}
				size="small"
				underline
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
		homePageUrl: PropTypes.string,
		privateBrowsing: PropTypes.bool,
		searchEngine: PropTypes.string,
		siteFiltering: PropTypes.string,
		startupPage: PropTypes.string
	};

	constructor (props) {
		super(props);
		this.state = {
			value: props.homePageUrl,
			siteFilteringOpen: false,
			clearPopupOpen: false,
			clearing: false,
			completePopupOpen: false,
			matchedPin: 'yet'
		};
	}

	componentDidMount () {
		document.addEventListener('webOSLocaleChange', this.onLocaleChange);
	}

	onLocaleChange = () => {
		setTimeout(() => {
			this.forceUpdate();
		}, 1000);
	}

	onChange = (ev) => {
		const {browser} = this.props;
		this.setState({value: ev.value});
		browser.settings.setHomePageUrl(ev.value);

	};
	keyPressHandler = (event) => {
        if (event.key === "Enter") {
            document.activeElement.blur();
          }
    }

	onToggleShowBookmarks = () => {
		const {browser, alwaysShowBookmarks} = this.props;
		browser.settings.setAlwaysShowBookmarks(!alwaysShowBookmarks);
	};

	onSelectStartupOption = ({selected}) => {
		const {browser} = this.props;
		browser.settings.setStartupPage(startupOptions[selected]);
	};

	onSelectSearchEngine = ({selected}) => {
		const {browser} = this.props;
		browser.settings.setSearchEngine(searchEngines[selected]);
	};

	onTogglePrivateBrowsing = () => {
		const {browser, privateBrowsing} = this.props;
		browser.setPrivateBrowsing(!privateBrowsing);
	};

	onClearBrowsingData = () => {
		this.setState({clearPopupOpen: true});
	};

	onClearYes = () => {
		const
			{browser} = this.props,
			obj = this;

		this.setState({clearing: true});
		Promise.race([
			browser.clearData(),
			new Promise((resolve) => {
				setTimeout(resolve, 3000);
			})
		]).then(
			() => {
				obj.setState({clearPopupOpen: false, clearing: false, completePopupOpen: true});
				setTimeout(() => {
					obj.setState({completePopupOpen: false});
				}, 1500);
			},
			() => {
				obj.setState({clearPopupOpen: false, clearing: false, completePopupOpen: true});
				setTimeout(() => {
					obj.setState({completePopupOpen: false});
				}, 1500);
			}
		);
	};

	onClearNo = () => {
		this.setState({clearPopupOpen: false});
	};

	startSiteFiltering = () => {
		this.setState({siteFilteringOpen: true});
	};

	onSubmitPinCode = (pinCode) => {
		const {browser} = this.props;
		if (browser.settings.matchPinCode(pinCode)) {
			this.setState({matchedPin: 'correct'});
			browser.openSiteFiltering();
		} else {
			this.setState({matchedPin: 'incorrect'});
		}
	};

	onClosePinPopup = () => {
		this.setState({siteFilteringOpen: false, matchedPin: 'yet'});
	};

	render () {
		const
			{
				className,
				startupPage,
				searchEngine,
				alwaysShowBookmarks,
				siteFiltering,
				privateBrowsing,
				...rest
			} = this.props,
			scrollerClass = classNames(css.scroller, {[css.shrinkHeight]: alwaysShowBookmarks}),
			settingContentsClass = classNames(className, css.settings),
			startupOption = startupOptions.indexOf(startupPage);

		delete rest.browser;
		delete rest.dispatch;
		delete rest.homePageUrl;

		return (
			<Scroller {...rest} className={scrollerClass}>
				<div className={settingContentsClass}>
					<BodyText>{$L('On Startup')}</BodyText>
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
								$L('Open the New Tab page'),
								$L('Continue where I left off'),
								$L('Home page:')
							]}
						</Group>
						<Input
							className={css.homePageInput}
							placeholder={$L('Enter URL')}
							value={this.state.value}
							onChange={this.onChange}
							onKeyPress={this.keyPressHandler}
							disabled={startupOption !== 2}
						/>
					</div>

					<BodyText>{$L('Search Engines')}</BodyText>
					<div className={css.indent}>
						<Group
							childComponent={RadioItem}
							itemProps={{inline: true, className: css.inlineGroupItem}}
							select="radio"
							selectedProp="selected"
							defaultSelected={searchEngines.indexOf(searchEngine)}
							onSelect={this.onSelectSearchEngine}
						>
							{searchEngines}
						</Group>
					</div>
					<BodyText className={css.menu}>{$L('Always Show Bookmarks Bar')}</BodyText>
					<OnOffButton onClick={this.onToggleShowBookmarks} selected={alwaysShowBookmarks} />
					<br />

					<BodyText className={css.menu}>{$L('Private Browsing')}</BodyText>
					<OnOffButton onClick={this.onTogglePrivateBrowsing} selected={privateBrowsing} />
					<br />

					<BodyText className={css.menu}>{$L('Site Filtering')}</BodyText>
					<OnOffButton onClick={this.startSiteFiltering} selected={(siteFiltering !== 'off')} />
					<br />

					<Popup
						centered
						open={this.state.clearPopupOpen}
						noAutoDismiss
					>
						{this.state.clearing ?
							<span>{$L('Clearing all browsing data...')}</span> :
							<span>{$L('Do you want to clear all browsing data?')}</span>
						}
						{this.state.clearing ?
							null :
							<buttons>
								<Button onClick={this.onClearNo} size="small">{$L('NO')}</Button>
								<Button onClick={this.onClearYes} size="small">{$L('YES')}</Button>
							</buttons>
						}
					</Popup>
					<Popup
						centered
						open={this.state.completePopupOpen}
						noAutoDismiss
					>
						<span>{$L('All browsing data has been deleted.')}</span>
					</Popup>

					<Button onClick={this.onClearBrowsingData} css={css} size="small">{$L('CLEAR BROWSING DATA')}</Button>

					<PinPopup
						open={this.state.siteFilteringOpen}
						onClose={this.onClosePinPopup}
						onSubmit={this.onSubmitPinCode}
						matched={this.state.matchedPin}
					/>

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
