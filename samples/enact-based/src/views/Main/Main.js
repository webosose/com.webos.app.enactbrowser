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

/*global chrome*/
/**
 * Main
 *
 */

import {contextTypes} from '@enact/i18n/I18nDecorator';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Spotlight from '@enact/spotlight';

import {Browser} from '../../NevaLib/BrowserModel';

import {BrowserIconButton as IconButton} from '../../components/BrowserIconButton';
import ContentView from '../ContentView';
import ExitFullScreenButton from '../../components/ExitFullScreenButton';
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
		let fullScreen = false;
		this.showExitButton = false;
		if (typeof chrome === 'object' && chrome.app.launchArgs) {
			const launchArgs = JSON.parse(chrome.app.launchArgs);
			if (launchArgs.fullMode) {
				fullScreen = true;
			}
			if (launchArgs.override_user_agent_string) {
				this.showExitButton = launchArgs.override_user_agent_string.indexOf('SmartTV') > -1
			}
		}
		this.state = {
			browser: {},
			fullScreen
		};
	}

	componentDidMount () {
		const browser = new Browser(this.props.store, maxTab);
		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState({browser});

		document.onwebkitfullscreenchange = this.onFullscreenChange.bind(this);
		document.addEventListener('keydown', this.onKeyDown);
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
			return browser.webViews[selectedId].webView;
		} else {
			return null;
		}
	}

	onFullScreen = () => {
		const webview = this.getSelectedWebview();

		if (webview) {
			webview.webkitRequestFullscreen();
		} else {
			this.setState({fullScreen: true});
		}
	}

	onExitFullScreen = () => {
		if (document.webkitFullscreenElement) {
			document.webkitExitFullscreen();
		} else {
			this.setState({fullScreen: false});
		}
	}

	onKeyDown = (ev) => {
		if (ev.keyCode === 27) { // ESC
			if (document.webkitFullscreenElement) {
				document.webkitExitFullscreen();
			} else {
				this.setState({fullScreen: false});
			}
		}
	}

	onFullscreenChange = () => {
		if (document.webkitFullscreenElement) {
			this.setState({fullScreen: true});
		} else {
			this.setState({fullScreen: false});
		}
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
		} else {
			Spotlight.resume();
		}
	}

	render () {
		const
			props = Object.assign({}, this.props),
			{browser, fullScreen} = this.state,
			webview = browser.tabs ? this.getSelectedWebview() : null;

		delete props.store;

		return (
			<div {...props}>
			{
				!fullScreen ? (
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
								tooltipText="Full Screen"
								type="fullscreenButton"
							/>
							{
								this.showExitButton ?
								<IconButton
									backgroundOpacity="transparent"
									className={css.button}
									onClick={this.onClose}
									tooltipText="Exit App"
									type="xButton"
								/> :
								null
							}
						</div>
						<TabBar browser={browser} />
					</div>
				) : null
			}
				<ContentView browser={browser} fullScreen={fullScreen} />
			{
				webview ? ReactDOM.createPortal(
					<div>
						<style>{`@import "main.css";`}</style>
						<ExitFullScreenButton fullScreen={fullScreen} onExitFullScreen={this.onExitFullScreen} />
					</div>,
					webview.shadowRoot
				) :
				<ExitFullScreenButton fullScreen={fullScreen} onExitFullScreen={this.onExitFullScreen} />
			}
			</div>
		);
	}
}

export default Main;
