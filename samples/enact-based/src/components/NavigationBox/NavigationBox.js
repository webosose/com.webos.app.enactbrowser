// Copyright 2018 LG Electronics, Inc.
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
 * Contains the declaration for the NavigationBox component.
 *
 */

import {connect} from 'react-redux';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';

import Button from '@enact/agate/Button';

import css from './NavigationBox.module.less';

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
				<Button
					backgroundOpacity="transparent"
					disabled={!canGoBack}
					onClick={onBack}
					icon="arrowlargeleft"
					size="large"
				/>
				<Button
					backgroundOpacity="transparent"
					className={css.button}
					disabled={!canGoForward}
					onClick={onForward}
					icon="arrowlargeright"
					size="large"
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
