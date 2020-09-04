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
import Item from '@enact/moonstone/Item';
import TooltipDecorator from '@enact/moonstone/TooltipDecorator';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import css from './ExitFullScreenButton.module.less';

import icon from '../../../assets/default/exit_fullscreen.svg';

const TooltipItem = TooltipDecorator(Item);

class ExitFullScreenButton extends Component {
	static propTypes = {
		fullScreen: PropTypes.bool,
		onExitFullScreen: PropTypes.func
	};

	constructor (props) {
		super(props);
	}

	render () {
		const {fullScreen, onExitFullScreen} = this.props;

		return (
			fullScreen ?
				<TooltipItem
					className={css.item}
					onClick={onExitFullScreen}
					tooltipPosition={'right middle'}
					tooltipText={$L('Exit Full Screen')}
				>
					<img
						alt={$L('Exit Full Screen')}
						className={css.image}
						src={icon}
					/>
				</TooltipItem> :
				null
		);
	}
}

export default ExitFullScreenButton;
