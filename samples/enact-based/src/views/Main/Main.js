// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global chrome*/
/**
 * Main
 *
 */

import $L from '@enact/i18n/$L';
import {contextTypes} from '@enact/i18n/I18nDecorator';
import React, {Component} from 'react';
import Spotlight from '@enact/spotlight';

import {Browser} from '../../NevaLib/BrowserModel';

import {BrowserIconButton as IconButton} from '../../components/BrowserIconButton';
import {connect} from 'react-redux';
import ContentView from '../ContentView';
import DialogView from '../DialogView';
import Dialog from '../../components/Dialog';
import Menu from '../../components/Menu';
import NavigationBox from '../../components/NavigationBox';
import Omnibox from '../../components/Omnibox';
import PropTypes from 'prop-types';
import {TabBar} from '../../components/TabBar';
import ZoomControl from '../../components/ZoomControl';

import css from './Main.less';

const maxTab = 7;

class MainBase extends Component {
	static contextTypes = contextTypes;
	static propTypes = {
		privateBrowsing: PropTypes.bool,
	}

	constructor (props) {
		super(props);

		this.state = {
			browser: {},
			dialog: null,
			fullScreen: false
		};

		this.fullScreenContentItem = React.createRef();
		this.showExitButton = true;
		if (typeof chrome === 'object' && chrome.app.launchArgs) {
			const launchArgs = JSON.parse(chrome.app.launchArgs);
			if (launchArgs.fullMode) {
				this.state.fullScreen = true;
			}
			if (launchArgs.hide_exit_button) {
				this.showExitButton = false;
			}
		}
	}

	componentDidMount () {
		const browser = new Browser(this.props.store, maxTab);
		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState({browser});

		document.addEventListener('dialog', this.onDialog);
		document.addEventListener('keydown', ({keyCode}) => {
			if (keyCode === 0x1CD) {
				browser.back();
			}
		});
	}

	componentDidUpdate () {
		const selectedWebview = this.getSelectedWebview();

		if (selectedWebview) {
			Spotlight.pause();
			selectedWebview.focus();
		} else {
			Spotlight.resume();
		}
	}

	getSelectedWebview = () => {
		const
			{browser} = this.state,
			selectedId = browser.tabs.getSelectedId();

		if (browser.webViews[selectedId]) {
			return browser.webViews[selectedId];
		} else {
			return null;
		}
	}

	onDialogClose = () => {
		const selectedWebview = this.getSelectedWebview();
		if (selectedWebview) {
			selectedWebview.isAlertsAllowed = this.state.dialog.isAlertsAllowed;
		}
		this.setState({dialog: null});
	}

	onDialog = (ev) => {
		const
			selectedWebview = this.getSelectedWebview(),
			{browser} = this.state;

		if (selectedWebview) {
			if (selectedWebview.isAlertsAllowed) {
				ev.preventDefault();
				this.setState({dialog: {
					...ev,
					alertsCount: selectedWebview.alertsCount,
					isAlertsAllowed: selectedWebview.isAlertsAllowed,
					alertsCountBeforePreventionRequest: browser.config.alertsCountBeforePreventionRequest
				}});
				selectedWebview.alertsCount++;
			}
		}
	}

	onFullScreen = () => {
		this.setState({fullScreen: true});
	}

	onExitFullScreen = () => {
		this.setState({fullScreen: false});
	}

	onClose = () => {
		this.state.browser.shutdown();
	}

	onClick = () => {
		Spotlight.resume();
	}

	onMouseLeave = () => {
		if (this.getSelectedWebview()) {
			Spotlight.pause();
		} else if (document.activeElement.tagName !== 'INPUT') {
			Spotlight.resume();
		}
	}

	render () {
		const
			props = Object.assign({}, this.props),
			{browser, dialog, fullScreen} = this.state;

		delete props.store;

		let private_mode = false;
		if (browser.getPrivateBrowsing !== undefined) {
			private_mode = browser.getPrivateBrowsing();
		}

		return (
			<div {...props}>
				<div onClick={this.onClick} onMouseLeave={this.onMouseLeave}
					className={private_mode ? css['main-bar'] : null}>
					{ fullScreen === false && <div className={css['flexbox-row']}>
						<NavigationBox browser={browser} />
						<Omnibox browser={browser} />
						<ZoomControl browser={browser} />
						<Menu browser={browser}/>
						<IconButton
							backgroundOpacity="transparent"
							className={css.button}
							onClick={this.onFullScreen}
							tooltipText={$L('Full screen')}
							type="fullscreenButton"
						/>
						{
							this.showExitButton ?
							<IconButton
								backgroundOpacity="transparent"
								className={css.button}
								onClick={this.onClose}
								tooltipText={$L('Exit app')}
								type="xButton"
							/> :
							null
						}
					</div> }
				{fullScreen === false && private_mode &&
					<div className={css['private-text']}>
					P R I V A T E &nbsp;&nbsp; B R O W S I N G</div>
				}
					<TabBar fullScreen={fullScreen} browser={browser} />
				</div>
				<ContentView
					browser={browser}
					ref={this.fullScreenContentItem}
					onExitFullScreen={this.onExitFullScreen}
					fullScreen={fullScreen}
				/>
			{
				dialog ?
				<Dialog
					dialog={dialog}
					onOK={this.onDialogClose}
					onCancel={this.onDialogClose}
				/>
				: null
			}
				{fullScreen === false && <DialogView />}
			</div>
		);
	}
}

const mapStateToProps = ({settingsState}) => ({
	privateBrowsing: settingsState.privateBrowsing,
});

const Main = connect(mapStateToProps, null)(MainBase);

export default Main;
