// Copyright (c) 2018-2020 LG Electronics, Inc.
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

import $L from '@enact/i18n/$L';
import {Button} from '@enact/agate/Button';
import TooltipDecorator from '@enact/agate/TooltipDecorator';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import css from './ExitFullScreenButton.module.less';

import icon from '../../../assets/default/exit_fullscreen.svg';

const TooltipButton = TooltipDecorator({tooltipDestinationProp: 'decoration'}, Button);

class ExitFullScreenButton extends Component {
	static propTypes = {
		fullScreen: PropTypes.bool,
		onExitFullScreen: PropTypes.func
	};

	constructor (props) {
		super(props);
	}

	render () {
		const
			{fullScreen} = this.props;

		return (
			fullScreen ?
				<TooltipButton
					className={css.exitButton}
					css={css}
					icon={icon}
					onClick={this.props.onExitFullScreen}
					tooltipText={$L('Exit Full Screen')}
				/> :
				null
		);
	}
}

export default ExitFullScreenButton;
