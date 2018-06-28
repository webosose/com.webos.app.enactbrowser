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
