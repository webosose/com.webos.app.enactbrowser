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
 * Contains the declaration for the Settings component.
 *
 */

import $L from '@enact/i18n/$L';
import BodyText from '@enact/agate/BodyText';
import Button from '@enact/agate/Button';
import {connect} from 'react-redux';
import classNames from 'classnames';
import Input from '@enact/agate/Input';
import Group from '@enact/ui/Group';
import kind from '@enact/core/kind';
import Popup from '@enact/agate/Popup';
import PropTypes from 'prop-types';
import RadioItem from '@enact/agate/RadioItem';
import {Component} from 'react';
import Scroller from '@enact/agate/Scroller';
import ToggleButton from '@enact/agate/ToggleButton';

import PinPopup from '../../components/PinPopup';
import css from './Settings.module.less';

const OnOffButton = kind({
	name: 'OnOffButton',
	render: (props) => {
		return (
			<ToggleButton
				toggleOffLabel={$L('Off')}
				toggleOnLabel={$L('On')}
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
			completePopupOpen: false,
			matchedPin: 'yet',
			resetState: '',
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.homePageUrl !== this.props.homePageUrl) {
			this.setState({ value: nextProps.homePageUrl });
		}
	}

	onChange = (ev) => {
		this.setState({value: ev.value});
	}

	saveHomePage = () => {
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
		browser.setPrivateBrowsing(!privateBrowsing);
	}

	onClearBrowsingData = () => {
		this.setState({clearPopupOpen: true});
	}

	onClearYes = () => {
		const
			{browser} = this.props,
			obj = this;

		this.setState({clearing: true});
		Promise.race([
			browser.clearData(browser.webViewFactory.getPartition()),
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

	onResetDeaults = () => {
		this.setState({ resetState: 'open' });
	}

	onResetNo = () => {
		this.setState({ resetState: '' });
	}

	_resetDone = () => {
		this.setState({ resetState: 'completed' });
		setTimeout(() => {
			this.setState({ resetState: '' });
		}, 1500);
	}

	onResetYes = () => {
		this.setState({ resetState: 'resetting' });
		Promise.race([
			this.props.browser.restoreSettings(),
			new Promise((resolve) => setTimeout(resolve, 3000)),
		])
			.then(this._resetDone, this._resetDone);
	}

	render () {
		const
			{
				className,
				startupPage,
				searchEngine,
				alwaysShowBookmarks,
				siteFiltering,
				privateBrowsing,
				browser,
				...rest
			} = this.props,
			scrollerClass = classNames(css.scroller, {
				[css.shrinkHeight]: alwaysShowBookmarks,
			}),
			classes = classNames(className, css.settings),
			startupOption = startupOptions.indexOf(startupPage);

		delete rest.dispatch;
		delete rest.homePageUrl;

		return (
			<Scroller {...rest} className={scrollerClass}>
				<div className={classes}>
					<BodyText>{$L('On Startup')}</BodyText>
					<div className={css.indent}>
						<Group
							childComponent={RadioItem}
							itemProps={{inline: false}}
							select="radio"
							selectedProp="selected"
							selected={startupOption}
							onSelect={this.onSelectStartupOption}
						>
							{[
								$L('Open the New Tab page'),
								$L('Continue where I left off'),
								$L('Home page:')
							]}
						</Group>
						<Input
							disabled={(startupOption !== 2)}
							placeholder={$L('Enter URL')}
							value={this.state.value}
							onChange={this.onChange}
							onBlur={this.saveHomePage}
						/>
					</div>

					<BodyText>{$L('Search Engines')}</BodyText>
					<div className={css.indent}>
						<Group
							className={css.flex}
							childComponent={RadioItem}
							itemProps={{inline: true, className: css.inlineGroupItem}}
							select="radio"
							selectedProp="selected"
							selected={searchEngines.indexOf(searchEngine)}
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

					{typeof browser.siteFiltering !== 'undefined' && (
						<>
							<BodyText className={css.menu}>{$L('Site Filtering')}</BodyText>
							<OnOffButton onClick={this.startSiteFiltering} selected={(siteFiltering !== 'off')} />
							<br />
						</>
					)}

					<Popup
						open={this.state.clearPopupOpen}
						noAutoDismiss
					>
						{this.state.clearing ?
							<span>{$L('Clearing all browsing data...')}</span>
							:
							<span>{$L('Do you want to clear all browsing data?')}</span>
						}
						{this.state.clearing ?
							null :
							<buttons>
								<Button onClick={this.onClearNo}>{$L('NO')}</Button>
								<Button onClick={this.onClearYes}>{$L('YES')}</Button>
							</buttons>
						}
					</Popup>
					<Popup
						open={this.state.completePopupOpen}
						noAutoDismiss
					>
						<span>{$L('All browsing data has been deleted.')}</span>
					</Popup>

					<Button onClick={this.onClearBrowsingData} css={css}>{$L('CLEAR BROWSING DATA')}</Button>
					<br /><br />

					<Popup
						open={this.state.resetState === 'open'}
						noAutoDismiss
						title={$L('Reset settings to default?')}
					>
						<p>{$L('This action will:')}</p>
						<p>
							• {$L('Reset some settings')}<br />
							• {$L('Delete cookies and other temporary site data')}<br />
							{privateBrowsing && (
								<>• {$L('Close all current web pages')}</>
							)}
						</p>
						<p>{$L('Bookmarks, history won\'t be affected.')}</p>
						<buttons>
							<Button onClick={this.onResetNo}>{$L('NO')}</Button>
							<Button onClick={this.onResetYes}>{$L('YES')}</Button>
						</buttons>
					</Popup>
					<Popup
						centered
						open={['resetting', 'completed'].includes(this.state.resetState)}
						noAutoDismiss
					>
						{this.state.resetState === 'resetting' ?
							<span>{$L('Resetting settings...')}</span>
							:
							<span>{$L('All settings data has been restored.')}</span>
						}
					</Popup>
					<Button onClick={this.onResetDeaults} css={css}>{$L('RESET SETTINGS')}</Button>

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
