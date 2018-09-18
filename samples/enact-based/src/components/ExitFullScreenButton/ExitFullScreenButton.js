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

import {Button} from '@enact/moonstone/Button';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Job} from '@enact/core/util';

import css from './ExitFullScreenButton.less';

class ExitFullScreenButton extends Component {
	static props = {
		fullScreen: PropTypes.bool,
		onExitFullScreen: PropTypes.func
	}

	constructor (props) {
		super(props);
		this.state = {
			animation: css.show
		};
	}

	componentDidMount () {
		this.startHideExitFullScreen.start();
	}

	componentWillUnmount() {
		this.startHideExitFullScreen.stop();
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
		this.setState({animation: css.show});
	}

	hide = () => {
		this.setState({animation: css.hide});
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
		const
			{animation} = this.state,
			{fullScreen} = this.props;

		return (
			<div className={css.topArea} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
				{
					fullScreen ?
					<Button
						className={animation}
						onClick={this.props.onExitFullScreen}
						onMouseEnter={this.onMouseEnter}
					>
					Exit Full Screen
					</Button>
					: null
				}
			</div>
		);
	}
}

export default ExitFullScreenButton;
