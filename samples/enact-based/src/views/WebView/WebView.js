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

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ErrorPage from '../ErrorPage';
import BlockedPageNotification from '../BlockedPageNotification';

const
	WebViewWrapperId = '_webview',
	DialogSupressTimeout = 30000;


class WebView extends Component {
	static propTypes = {
		id: PropTypes.string,
		webView: PropTypes.object
	}

	constructor (props) {
		super(props);

		this.state = {
			load_commited: false, // load has commited
			show_error_page: false, // show error page, blocked page info (or webview) on next rendering
			show_blocked_page_notification: false,
			load_started: false,
			load_stopped: false,
			show_webview: false,
			show_error_dialog: false,
			suppressDialog: false,
			state: "navigating",
			post_render_task: null,
		};
	}

	static getDerivedStateFromProps = (nextProps, prevState) => {
		let
			{browser, id, tabs} = nextProps,
			{state} = prevState,
			error = tabs[id].error;

		let state_set = Object.assign({}, prevState);

		state_set.show_webview = false;
		state_set.show_error_page = false;
		state_set.show_blocked_page_notification = false;
		state_set.show_error_dialog = false;

		if (error !== null) {
			state = "showing_error";
		}

		switch (state) {
			case "navigating": {
				break;
			}

			case "loading_site": {
				state_set.show_webview = true;
				break;
			}

			case "showing_error": {

				switch (error) {
					case 'PAGE_UNRESPONSIVE':
						state_set.show_error_dialog = true;
						state_set.show_webview = true;
						state_set.show_error_page = true;
						break;

					case 'RENDERER_CRASHED':
						state_set.show_error_page = true;
						break;

					case 'ERR_BLOCKED_BY_CLIENT':
						state_set.show_blocked_page_notification = true;
						break;

					default:
						if (browser.settings.getUseJSErrorPage()) {
							state_set.show_error_page = true;
						} else {
							state_set.show_webview = true;
						}
						break;
				}
				break; // case: "showing_error"
			}

			case "deactivated":
				state_set.show_webview = false; // when 'stop' pressed in 'unresponsive' dialog
				state_set.show_error_page = true;
				break;

			case "showing_site": {
				state_set.show_webview = true;
				break;
			}
		} // switch

		if (JSON.stringify(state_set) !== JSON.stringify(prevState)) {
			return state_set;
		} else {
			return null;
		}
	}

	isOnlyForBuiltInErrorPage = (err) => {
		return ['PAGE_UNRESPONSIVE','RENDERER_CRASHED'].includes(err);
	};

	MaybeLoadingStarted = () => {
		let err = this.props.tabs[this.props.id].error;
		if (this.state.load_commited === true && this.state.load_started === true) {
			if (err === null) {
				this.setState({state: "loading_site"});
			} else { // error`
				if (this.isOnlyForBuiltInErrorPage(err)) {
					this.setState({state: "showing_builtin_error_page"});
				} else if (err === 'ERR_BLOCKED_BY_CLIENT') {
					this.setState({state: "showing_blocked_notification"});
				} else {
					this.setState({state: "showing_error"});
				}
			}

			this.setState({load_started: false});
			this.setState({load_commited: false});
			this.setState({load_stopped: false});
		}
	}

	onLoadCommit = () => {
		this.setState({load_commited: true});
		this.MaybeLoadingStarted();
	}

	onLoadStart = () => {
		this.setState({load_started: true});
		if (this.state.state === "showing_site") {
			this.setState({state: "navigating"});
		}
		this.MaybeLoadingStarted();
	}

	onLoadStop = () => {
		this.setState({load_started: false});
		this.setState({load_commited: false});
		this.setState({load_stopped: true});

		if (this.props.tabs[this.props.id].error === null) {
			this.setState({state: "showing_site"});
		} else {
			this.setState({state: "showing_error"});
		}
	}

	onNavigate = (ev) => {
		this.setState({state: "navigating"}, ev.detail.call_after_render);
	}

	componentDidMount () {
		this.props.webView.insertIntoDom(this.props.id + WebViewWrapperId);
		this.props.webView.addEventListener('loadcommit', this.onLoadCommit);
		this.props.webView.addEventListener('loadstart', this.onLoadStart);
		this.props.webView.addEventListener('loadstop', this.onLoadStop);
		this.props.webView.addEventListener('navigate', this.onNavigate);
	}

	onWait = () => {
		this.setState({suppressDialog: true});

		const releaseDialog = () => {
			this.setState({suppressDialog: false});
		};
		setTimeout(releaseDialog, DialogSupressTimeout);
	}

	onStop = () => {
		this.props.webView.deactivate();
		this.setState({show_error_dialog: false});
		this.setState({state: "deactivated"});
	}

	openSiteFiltering = () => {
		this.props.browser.openSettings();
	}

	render () {
		let {id, tabs, style, ...rest} = this.props,
			{show_error_page, show_webview, show_error_dialog, suppressDialog} = this.state,
			{show_blocked_page_notification} = this.state,
			err = tabs[id].error,
			id_ = id + WebViewWrapperId;

			// TBD: In case of BS, getBoundingClientRect is used to get container div size and position.
			// It works only if the element is visible.
			// Need to refactor this module for WVE support (ErrorPage and Webview show/hide logic)
			show_webview = true;

		delete rest.webView;
		delete rest.browser;

		const view_page =
			<div
				style={style}
				id={id_}
				hidden={!show_webview}
				{...rest}
			/>;

		const error_page =
			<ErrorPage
				id={id_ + "errorPage"}
				style={style}
				errorMsg={err}
				show_error_dialog={show_error_dialog && !suppressDialog}
				onWait={this.onWait}
				onStop={this.onStop}
				hidden={!show_error_page}
			/>;

		const blocked_page_notification =
			<BlockedPageNotification
				id={id_ + "blockedPage"}
				style={style}
				onOpenSiteFiltering={this.openSiteFiltering}
				hidden={!show_blocked_page_notification}
			/>;

		return (
			<div>
				{view_page}
				{error_page}
				{blocked_page_notification}
			</div>
		);
	}
}

export default WebView;
