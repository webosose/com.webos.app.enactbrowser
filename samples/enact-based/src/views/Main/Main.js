// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* global chrome*/
/**
 * Main
 *
 */

import $L from '@enact/i18n/$L';
import contextTypes from '@enact/i18n/I18nDecorator';
import Button from '@enact/agate/Button';
import Spotlight from '@enact/spotlight';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TooltipDecorator from '@enact/agate/TooltipDecorator';

import {Browser, TabTypes} from '../../NevaLib/BrowserModel';

import ContentView from '../ContentView';
import DialogView from '../DialogView';
import Dialog from '../../components/Dialog';
import Menu from '../../components/Menu';
import NavigationBox from '../../components/NavigationBox';
import Omnibox from '../../components/Omnibox';
import Share from '../../components/Share';
import {TabBar} from '../../components/TabBar';
import ZoomControl from '../../components/ZoomControl';

import css from './Main.module.less';

const TooltipButton = TooltipDecorator({tooltipDestinationProp: 'decoration'}, Button);

const maxTab = 7;

class Main extends Component {
	static contextTypes = contextTypes;

	static propTypes = {
		store: PropTypes.any
	};

	constructor (props) {
		super(props);

		this.state = {
			browser: {},
			dialog: null,
			fullScreen: false
		};

		this.fullScreenContentItem = React.createRef();
		if (typeof chrome === 'object' && chrome.app.launchArgs) {
			const launchArgs = JSON.parse(chrome.app.launchArgs);
			if (launchArgs.fullMode) {
				this.state.fullScreen = true;
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

		document.addEventListener('setInsetY', this.onSetInsetY);
		document.addEventListener('webOSRelaunch', this.onRelaunch);
		document.addEventListener('webOSLocaleChange', this.onLocaleChange);
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

	componentWillUnmount () {
		document.removeEventListener('webOSRelaunch');
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
	};

	onDialogClose = () => {
		this.setState({dialog: null});
	};

	onDialog = (ev) => {
		ev.preventDefault();
		this.setState({dialog: ev});
	};

	onFullScreen = () => {
		this.setState({fullScreen: true});
	};

	onExitFullScreen = () => {
		this.setState({fullScreen: false});
	};

	onClick = () => {
		Spotlight.resume();
	};

	onMouseLeave = () => {
		if (this.getSelectedWebview()) {
			Spotlight.pause();
		} else if (document.activeElement.tagName !== 'INPUT') {
			Spotlight.resume();
		}
	};

	onSetInsetY = (ev) => {
		const selectedWebview = this.getSelectedWebview();
		if (!selectedWebview) {
			return;
		}
		const height = ev.detail;
		let script = `
			var elements = document.body.getElementsByClassName('vkbInset');
			if (elements.length !== 0) {
				window.scrollTo(0, window.pageYOffset - parseInt(elements[0].style.height));
				for (let i = elements.length - 1; i >= 0; --i) {
					elements[i].remove();
				}
			}
		`;
		if (height > 0) {
			script += `
				var node = document.createElement('div');
				node.setAttribute('class','vkbInset');
				node.style.width = '100%';
				node.style.height = ${height} + 'px';
				document.body.appendChild(node);
				window.scrollBy(0, ${height});
			`;
		}
		selectedWebview.executeScript({ code: script});
	}

	onRelaunch = (ev) => {
		if (ev.detail) {
			if ((typeof ev.detail.url === 'string' && ev.detail.url !== '') ||
				(typeof ev.detail.uri === 'string' && ev.detail.uri !== '')) {
				let url = ev.detail.url ? ev.detail.url : ev.detail.uri;
				const
					{browser} = this.state,
					numOfTabs = browser.tabs.count();

				url = browser.searchService.possiblyUrl(url) ? url : browser.searchService.getSearchUrl(url);

				if (numOfTabs < browser.tabs.maxTabs) {
					browser.createTab(TabTypes.WEBVIEW, url);
				} else {
					browser.navigate(url);
				}
			}
		}
	};

	onLocaleChange = () => {
		chrome.runtime.sendMessage({event: 'localechange'});
	};

	render () {
		const
			props = Object.assign({}, this.props),
			{browser, dialog, fullScreen} = this.state;

		delete props.store;

		return (
			<div {...props}>
				<div onClick={this.onClick} onMouseLeave={this.onMouseLeave}>
					{ fullScreen === false && <div className={css['flexbox-row']}>
						<NavigationBox browser={browser} />
						<Share />
						<Omnibox browser={browser} />
						<ZoomControl browser={browser} />
						<Menu browser={browser} />
						<TooltipButton
							onClick={this.onFullScreen}
							icon="fullscreen"
							tooltipText={$L('Full screen')}
							size="small"
						/>
					</div> }
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
						/> :
						null
				}
				{fullScreen === false && <DialogView />}
			</div>
		);
	}
}

export default Main;
