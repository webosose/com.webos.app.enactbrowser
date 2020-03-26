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
			last_error: null, // error value that was before previous rendering
			load_commit: false, // load has commited
			show_error_page: false, // show error page, blocked page info (or webview) on next rendering
			show_blocked_page_notification: false,
			show_webview: true,
			show_error_dialog: false,
			suppressDialog: false,
		};
	}

	static getDerivedStateFromProps = (nextProps, prevState) => {
		let
			{browser, id, tabs, webView} = nextProps,
			{last_error, load_commit} = prevState,
			error = tabs[id].error;

		let isOnlyForBuiltInErrorPage = (err) => {
			return ['PAGE_UNRESPONSIVE','RENDERER_CRASHED'].includes(err);
		};

		const
			is_unresponsive = (error === 'PAGE_UNRESPONSIVE'),
			need_render = (load_commit === true) ||
				(!is_unresponsive && last_error === null) || // first time error appeared
				(isOnlyForBuiltInErrorPage(error) || // because comes without loadcommit
				 isOnlyForBuiltInErrorPage(last_error));
		const {suppressDialog} = prevState;

		if (!need_render) {
			return null;
		}

		if (webView.activeState === 'deactivated') { // webview closed
			return {
				show_webview: false,
				show_error_page: true,
				show_blocked_page_notification: false,
				show_error_dialog: false,
				suppressDialog: false,
			};
		} else if (error === null) {
			return { // show webview
				last_error: error,
				load_commit: false,
				show_error_page: false,
				show_blocked_page_notification: false,
				show_webview: true,
				show_error_dialog: false,
			};
		} else if (isOnlyForBuiltInErrorPage(error)) {
			const show_dialog = (is_unresponsive === true && suppressDialog === false);
			return { // show errors from except list on built-in error page
				last_error: error,
				load_commit: false,
				show_webview: (is_unresponsive === true),
				show_error_dialog: show_dialog,
				show_error_page: !is_unresponsive,
				show_blocked_page_notification: false,
			};
		} else if (error === 'ERR_BLOCKED_BY_CLIENT') {
			return { // show blocked page notification
				last_error: error,
				load_commit: false,
				show_error_page: false,
				show_blocked_page_notification: true,
				show_webview: false,
				show_error_dialog: false,
				suppressDialog: false,
			};
		} else {
			if (!browser.config.useBuiltInErrorPages) {
				return { // show error on buit-in error page
					last_error: error,
					load_commit: false,
					show_error_page: true,
					show_blocked_page_notification: false,
					show_webview: false,
					show_error_dialog: false,
				};
			} else {
				return { // show error in webview
					last_error: error,
					load_commit: false,
					show_error_page: false,
					show_blocked_page_notification: false,
					show_webview: true,
					show_error_dialog: false,
				};
			}
		}
	}

	onLoadCommit = () => {
		this.setState({load_commit: true});
	}

	componentDidMount () {
		this.props.webView.insertIntoDom(this.props.id + WebViewWrapperId);
		this.props.webView.addEventListener('loadcommit', this.onLoadCommit);
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
	}

	openSiteFiltering = () => {
		this.props.browser.openSettings();
	}

	render () {
		const {id, tabs, style, ...rest} = this.props,
			{show_error_page, show_webview, show_error_dialog, suppressDialog} = this.state,
			{show_blocked_page_notification} = this.state,
			err = tabs[id].error,
			id_ = id + WebViewWrapperId;

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
