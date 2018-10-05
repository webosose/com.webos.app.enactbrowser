// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the NavigationBox component.
 *
 */

import $L from '@enact/i18n/$L';
import {connect} from 'react-redux';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import {BrowserIconButton as IconButton} from '../BrowserIconButton';

import css from './NavigationBox.less';

const nop = () => {};

const NavigationBoxBase = kind({
	name: 'NavigationBox',

	propTypes: {
		browser: PropTypes.object,
		canGoBack: PropTypes.bool,
		canGoForward: PropTypes.bool,
		onBack: PropTypes.func,
		onForward: PropTypes.func
	},

	defaultProps: {
		canGoBack: false,
		canGoForward: false,
		onBack: nop,
		onForward: nop
	},

	styles: {
		css,
		className: 'navigation-box'
	},

	handlers: {
		onBack: (ev, {browser}) => {
			browser.back();
		},
		onForward: (ev, {browser}) => {
			browser.forward();
		}
	},

	render: ({canGoBack, canGoForward, onBack, onForward, ...rest}) => {
		delete rest.browser;
		delete rest.dispatch;

		return (
			<div {...rest}>
				<IconButton
					backgroundOpacity="transparent"
					disabled={!canGoBack}
					onClick={onBack}
					tooltipText={$L('Previous')}
					type="backButton"
				/>
				<IconButton
					backgroundOpacity="transparent"
					className={css.button}
					disabled={!canGoForward}
					onClick={onForward}
					tooltipText={$L('Next')}
					type="forwardButton"
				/>
			</div>
		);
	}
});

const mapStateToProps = ({tabsState}) => {
	const {selectedIndex, ids, tabs} = tabsState;

	if (ids.length > 0) {
		const
			{navState} = tabs[ids[selectedIndex]];
		if (navState) {
			return {
				canGoBack: navState.canGoBack,
				canGoForward: navState.canGoForward
			}
		}
	} else {
		return {
			canGoBack: false,
			canGoForward: false
		};
	}
};


const NavigationBox = connect(mapStateToProps, null)(NavigationBoxBase);

export default NavigationBox;
