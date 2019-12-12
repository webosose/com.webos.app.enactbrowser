// Copyright (c) 2018-2019 LG Electronics, Inc.
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

const WebViewWrapperId = '_webview';

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
			show_error_page: false, // show error page (or webview) on next rendering
			show_webview: true,
		};
	}

	static getDerivedStateFromProps = (nextProps, prevState) => {
		let
			{browser, id, tabs} = nextProps,
			{last_error, load_commit} = prevState,
			error = tabs[id].error;

		let isOnlyForBuiltInErrorPage = (error) => {
			return ['PAGE_UNRESPONSIVE','RENDERER_CRASHED'].includes(error);
		};

		const
			is_unresponsive = (error === 'PAGE_UNRESPONSIVE'),
			need_render = (load_commit === true) ||
				(!is_unresponsive && last_error === null) || // first time error appeared
				(isOnlyForBuiltInErrorPage(error) || // because comes without loadcommit
				 isOnlyForBuiltInErrorPage(last_error));

		if (!need_render)
			return null;

		if (error === null) {
			return { // show webview
				last_error: error,
				load_commit: false,
				show_error_page: false,
				show_webview: true,
			};
		} else if (isOnlyForBuiltInErrorPage(error)) {
			return { // show errors from except list on built-in error page
				last_error: error,
				load_commit: false,
				show_error_page: true,
				show_webview: (is_unresponsive === true),
			};
		} else {
			if (!browser.config.useBuiltInErrorPages) {
				return { // show error on buit-in error page
					last_error: error,
					load_commit: false,
					show_error_page: true,
					show_webview: false,
				};
			} else {
				return { // show error in webview
					last_error: error,
					load_commit: false,
					show_error_page: false,
					show_webview: true,
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

	render () {
		const {id, tabs, style, browser, webView, ...rest} = this.props,
			{show_error_page} = this.state,
			{show_webview} = this.state,
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
				hidden={!show_error_page}
			/>;

		return (
			<div>
				{view_page}
				{error_page}
			</div>
		);
	}
}

export default WebView;
