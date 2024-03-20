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
import {Component} from 'react';

import css from './ExitFullScreenButton.module.less';

class ExitFullScreenButton extends Component {
	static props = {
		fullScreen: PropTypes.bool,
		webContentFullScreen: PropTypes.bool,
		onExitFullScreen: PropTypes.func,
		browser: PropTypes.object,
		exitFullscreenButton: PropTypes.object
	}

	constructor (props) {
		super(props);
		this.state = {
			animation: css.show,
			timeoutId: 0
		};

		if (typeof window !== 'undefined') {
			window.document.addEventListener('click', () => {
				this.hide();
			});
		}
	}

	componentDidMount () {
		console.log(`ExitFullScreenButton::componentDidMount`);
		this.hide();
	}

	componentWillUnmount() {
		this.hide();
	}

	UNSAFE_componentWillReceiveProps (nextProps) {
		if (nextProps.fullScreen || nextProps.webContentFullScreen) {
			this.show();
		} else {
			this.hide();
		}
	}

	show = () => {
		this.props.exitFullscreenButton.show();
	}

	hide = () => {
		this.props.exitFullscreenButton.hide();
	}

	onMouseEnter = () => {
		clearTimeout(this.state.timeoutId);
		if (this.props.webContentFullScreen || this.props.fullScreen) {
			this.show();
		}
	}

	onMouseLeave = () => {
		this.setState({timeoutId: setTimeout(() => {this.hide()}, 3000)});
	}

	render () {
		return (
			<div className={css.topArea} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} />
		);
	}
}

export default ExitFullScreenButton;
