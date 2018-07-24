// Copyright (c) 2018 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Contains the declaration for the FullScreenButton component.
 *
 */

import {Button} from '@enact/moonstone/Button'
import classNames from 'classnames';
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
			animation: css.hide
		};

		this.invisibleCSS = true;
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.fullScreen) {
			this.invisibleCSS = false;
			this.show();
			this.startHideExitFullScreen.start();
		} else {
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
			exitClasses = classNames(animation, this.invisibleCSS ? css.invisible : '');

		return (
			<div className={css.topArea} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
				<Button
					className={exitClasses}
					onClick={this.props.onExitFullScreen}
					onMouseEnter={this.onMouseEnter}
				>
				Exit Full Screen
				</Button>
			</div>
		);
	}
}

export default ExitFullScreenButton;
