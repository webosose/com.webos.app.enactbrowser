// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the RecentlyClosed component.
 *
 */

import $L from '@enact/i18n/$L';
import Button from '@enact/moonstone/Button';
import React, {Component} from 'react';

import css from './RecentlyClosed.less';

class RecentlyClosed extends Component {
	constructor (props) {
		super(props);
		this.state = {
			showing: false
		}
	}

	onClick = () => {
		if (!this.state.showing) {
			this.props.onClick();
		}
		this.setState((prevState) => ({
			showing: !prevState.showing
		}));
	}

	render () {
		return (
			<div className={css.recentlyClosed}>
				<Button css={css} onClick={this.onClick} small>{$L('RECENTLY CLOSED') + ' >'}</Button>
				{this.state.showing ? this.props.children : null}
			</div>
		);
	}
}

export default RecentlyClosed;
