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

	showHideWebview = () => {
		let tab = this.props.tabs[this.props.id];
		let err = tab.error;
		let id_ = this.props.id + WebViewWrapperId;
		let use_chrom_err_page = this.props.browser.config.useBuiltInErrorPages;

		let show_webview = err === null || use_chrom_err_page
			|| err === 'RENDERER_CRASHED' || err === 'PAGE_UNRESPONSIVE';
		let show_error = !show_webview;

		let webview_elem = document.getElementById(id_);
		let errpage_elem = document.getElementById(id_ + "errorPage");

		if (webview_elem !== null) {
			if (show_webview) {
				webview_elem.removeAttribute("hidden");
			} else {
				webview_elem.setAttribute("hidden", "");
			}
		}

		if (errpage_elem !== null) {
			if (show_error) {
				errpage_elem.removeAttribute("hidden");
			} else {
				errpage_elem.setAttribute("hidden", "");
			}
		}
	}

	onLoadCommit() {
		this.showHideWebview();
	}

	componentDidMount () {
		this.props.webView.insertIntoDom(this.props.id + WebViewWrapperId);
		this.props.webView.addEventListener('loadcommit', this.onLoadCommit.bind(this));
	}

	render () {
		const {id, tabs, style, ...rest} = this.props;

		delete rest.browser;
		delete rest.webView;

		let id_ = id + WebViewWrapperId;
		return (
			<div>
				<ErrorPage id={id_ + "errorPage"} style={style} hidden
					errorMsg={tabs[id].error} />
				<div style={style} hidden id={id_} {...rest} />
			</div>
		);
	}
}

export default WebView;
