// Copyright (c) 2018-2019 LG Electronics, Inc.
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
import ContentView from '../ContentView';
import DialogView from '../DialogView';
import Dialog from '../../components/Dialog';
import Menu from '../../components/Menu';
import NavigationBox from '../../components/NavigationBox';
import Omnibox from '../../components/Omnibox';
import {TabBar} from '../../components/TabBar';
import ZoomControl from '../../components/ZoomControl';

import css from './Main.less';

const maxTab = 7;

class Main extends Component {
	static contextTypes = contextTypes;

	constructor (props) {
		super(props);

		this.state = {
			browser: {},
			dialog: null,
			fullScreen: false
		};

		this.fullScreenContentItem = React.createRef();
		this.showExitButton = false;
		if (typeof chrome === 'object' && chrome.app.launchArgs) {
			const launchArgs = JSON.parse(chrome.app.launchArgs);
			if (launchArgs.fullMode) {
				this.state.fullScreen = true;
			}
			if (launchArgs.override_user_agent_string) {
				this.showExitButton = launchArgs.override_user_agent_string.indexOf('WebOS') > -1
			}
		}
	}

	componentDidMount () {
		const browser = new Browser(this.props.store, maxTab);
		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState({browser});

		document.addEventListener('webkitfullscreenchange', this.onFullscreenChange);
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
		this.setState({dialog: null});
	}

	onDialog = (ev) => {
		ev.preventDefault();
		this.setState({dialog: ev});
	}

	onFullScreen = () => {
		this.fullScreenContentItem.current.webkitRequestFullscreen();
	}

	onExitFullScreen = () => {
		if (document.webkitFullscreenElement) {
			this.exitFullscreenWasPressed = true;
			document.webkitExitFullscreen();
		}
	}

	onFullscreenChange = () => {
		// First check is needed to handle recursive fullscreen situations.
		// If we first entered fullscreen from UI and then from video player
		// then we don't want to exit from fullscreen when pressing exit from
		// fullscreen from video player.
		if (document.webkitFullscreenElement && this.exitFullscreenWasPressed) {
			document.webkitExitFullscreen();
		} else if (document.webkitFullscreenElement) {
			this.setState({fullScreen: true});
		} else {
			this.setState({fullScreen: false});
		}
		this.exitFullscreenWasPressed = false;
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

		return (
			<div {...props}>
				<div onClick={this.onClick} onMouseLeave={this.onMouseLeave}>
					<div className={css['flexbox-row']}>
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
					</div>
					<TabBar browser={browser} />
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
				<DialogView />
			</div>
		);
	}
}

export default Main;
