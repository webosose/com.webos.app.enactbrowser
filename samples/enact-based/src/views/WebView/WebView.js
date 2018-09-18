// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the ContentView component.
 *
 */

import PropTypes from 'prop-types';
import React, {Component} from 'react';

const WebViewWrapperId = '_webview';

class WebView extends Component {
	static propTypes = {
		id: PropTypes.string,
		webView: PropTypes.object
	}

	componentDidMount () {
		this.props.webView.insertIntoDom(this.props.id + WebViewWrapperId);
	}

	render () {
		const {id, ...rest} = this.props;
		delete rest.webView;

		return (
			<div>
				<div id={id + WebViewWrapperId} {...rest} />
			</div>
		);
	}
}

export default WebView;
