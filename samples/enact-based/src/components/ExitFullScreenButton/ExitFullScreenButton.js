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
import {Job} from '@enact/core/util';

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
		this.startHideExitFullScreen.start();
		this.props.browser.createExitFullscreenButton();
		this.hide();
	}

	componentWillUnmount() {
		this.startHideExitFullScreen.stop();
		this.hide();
		// TBD: destroy pageVIew
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.fullScreen) {
			this.show();
			this.startHideExitFullScreen.start();
		} else {
			this.startHideExitFullScreen.stop();
			this.hide();
		}
	}

	show = () => {
		this.props.browser.showExitFullscreenButton();
	}

	hide = () => {
		this.props.browser.hideExitFullscreenButton();
	}

	startHideExitFullScreen = new Job(this.hide, 4000);

	onMouseEnter = () => {
		if (this.props.fullScreen) {
			this.show();
		}
	}

	onMouseLeave = () => {
		this.startHideExitFullScreen.start();
	}

	render () {
		return (
			<div className={css.topArea} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} />
		);
	}
}

export default ExitFullScreenButton;
