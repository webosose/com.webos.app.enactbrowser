// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the FullScreenButton component.
 *
 */

import PropTypes from 'prop-types';
import React, {Component} from 'react';

import css from './ExitFullScreenButton.less';

class ExitFullScreenButton extends Component {
	static props = {
		fullScreen: PropTypes.bool,
		onExitFullScreen: PropTypes.func,
		browser: PropTypes.object
	}

	constructor (props) {
		super(props);
		this.state = {
			animation: css.show
		};
	}

	componentDidMount () {
		console.log(`ExitFullScreenButton::componentDidMount`);
		this.hide();
	}

	componentWillUnmount() {
		this.hide();
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.fullScreen) {
			this.show();
		} else {
			this.hide();
		}
	}

	show = () => {
		this.props.browser.exitFullscreenButton.show();
	}

	hide = () => {
		this.props.browser.exitFullscreenButton.hide();
	}

	onMouseEnter = () => {
		if (this.props.fullScreen) {
			this.show();
		}
	}

	onMouseLeave = () => {
		// TBD: implement input focus management
	}

	render () {
		return (
			<div className={css.topArea} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} />
		);
	}
}

export default ExitFullScreenButton;
