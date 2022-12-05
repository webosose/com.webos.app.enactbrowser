// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the WebView component.
 *
 */

import Button from '@enact/agate/Button';
import Popup from '@enact/agate/Popup';
import $L from '@enact/i18n/$L';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ErrorPage from '../ErrorPage';

const
	WebViewWrapperId = '_webview',
	errorRendererCrashed = 'RENDERER_CRASHED',
	errorUnresponsive = 'PAGE_UNRESPONSIVE',
	errorNameNotResolved = "ERR_NAME_NOT_RESOLVED",
	errorNetworkchanged = "ERR_NETWORK_CHANGED",
	errorBlockedBySiteFilter = "ERR_BLOCKED_BY_SITEFILTER",
	timeoutToSuppressDialog = 30000;

const LOAD_STATE = {
	UNLOADED: 0,
	READY: 1,
	LOADED: 2
};

class WebView extends Component {
	static propTypes = {
		id: PropTypes.string,
		tabs: PropTypes.any,
		webView: PropTypes.object
	};

	constructor(props) {
		super(props);

		this.state = {
			hideDialog: true,
			hideErrorPage: true,
			hideWebview: true,
			load: LOAD_STATE.UNLOADED,
			suppressDialog: false,
		};
	}

	static getDerivedStateFromProps = (nextProps, prevState) => {
		let
			{ browser, id, tabs } = nextProps,
			{ load } = prevState,
			error = tabs[id].error;
		if (load === LOAD_STATE.UNLOADED && error === errorBlockedBySiteFilter) {
			return {
				hideDialog: true,
				hideErrorPage: false,
				hideWebview: true
			};
		}
		if (load === LOAD_STATE.LOADED) {
			if (error === errorNameNotResolved || error === errorNetworkchanged) {
				return {
					hideDialog: true,
					hideErrorPage: false,
					hideWebview: true
				};
			}
		}

		if (load === LOAD_STATE.READY) {
			if (error === null) {
				return {
					suppressDialog: false,
					hideDialog: true,
					hideErrorPage: true,
					hideWebview: false
				};
			} else if (error === errorUnresponsive) {
				if (prevState.suppressDialog) {
					return {
						hideDialog: true,
						hideErrorPage: true,
						hideWebview: false
					};
				} else {
					return {
						hideDialog: false,
						hideErrorPage: true,
						hideWebview: false
					};
				}
			} else if (error === errorRendererCrashed || browser.config.useBuiltInErrorPages) {
				return {
					hideDialog: true,
					hideErrorPage: true,
					hideWebview: false
				};
			} else {
				return {
					hideDialog: true,
					hideErrorPage: false,
					hideWebview: true
				};
			}
		}

		return null;
	};

	componentDidMount() {
		this.props.webView.insertIntoDom(this.props.id + WebViewWrapperId);
		this.props.webView.addEventListener('loadcommit', this.onLoadCommit);
		this.props.webView.addEventListener('contentload', this.onLoadContent);
	}

	onLoadCommit = () => {
		if (this.state.load !== LOAD_STATE.READY) {
			this.setState({ load: LOAD_STATE.READY });
		}
	};

	onLoadContent = () => {
		if (this.state.load === LOAD_STATE.READY) {
			this.setState({ load: LOAD_STATE.LOADED });
		}
	};

	enableDialog = () => {
		this.setState({ suppressDialog: false });
	};

	onWait = () => {
		setTimeout(this.enableDialog, timeoutToSuppressDialog);
		this.setState({ suppressDialog: true });
	};

	onStop = () => {
		this.props.webView.deactivate();
		this.setState({
			hideDialog: true,
			hideErrorPage: false,
			hideWebview: true,
			load: LOAD_STATE.UNLOADED
		});
	};

	render() {
		const
			{ id, tabs, style, ...rest } = this.props,
			{ hideDialog, hideErrorPage, hideWebview } = this.state;

		delete rest.browser;
		delete rest.webView;
		return (
			<div>
				<div
					id={id + WebViewWrapperId}
					style={style}
					{...rest}
					hidden={hideWebview}
				/>
				<ErrorPage
					style={style}
					errorMsg={tabs[id].error}
					hidden={hideErrorPage}
				/>
				<Popup
					centered
					noAutoDismiss
					open={!hideDialog}
				>
					<p>{$L('The current page has become unresponsive. You can wait for it to become responsive.')}</p>
					<buttons>
						<Button size="small" onClick={this.onWait}>{$L('Wait')}</Button>
						<Button size="small" onClick={this.onStop}>{$L('Stop')}</Button>
					</buttons>
				</Popup>
			</div>
		);
	}
}

export default WebView;