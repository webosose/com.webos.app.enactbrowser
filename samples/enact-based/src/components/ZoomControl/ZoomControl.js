// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the ZoomControl component.
 *
 */

import $L from '@enact/i18n/$L';
import {Component} from 'react';
import { isWindowReady } from '@enact/core/snapshot';

import Button from '@enact/agate/Button';
import Ipc from 'js-browser-lib/Ipc';
import css from './ZoomControl.module.less';

class ZoomControl extends Component {
	constructor (props) {
		super(props);
		this.state = {
			isOpened: false,
		}
		if (isWindowReady()) {
			this.ipc = new Ipc("ipc_ZoomControl");
			this.ipc.subscribe('click', () => {
				this.setState({ isOpened: false });
			});
		}
	}

	toggleMenu = (event) => {
		if (!this.props.browser.isWebViewTabSelected()) {
			console.log(`Zoom menu will not be shown because no webview tab selected.`);
			return;
		}
		event.stopPropagation();
		const isOpened = this.state.isOpened;
		if (this.state.isOpened) {
			this.props.zoomControl.hide();
		} else {
			this.props.browser.sendZoomFactorToZoomMenu();
			document.addEventListener('click', () => {
				this.props.zoomControl.hide();
				this.setState({isOpened: false});
			}, {once: true});
			this.props.zoomControl.showAbove("nevaBrowserZoomControlButton");
		}
		this.setState({isOpened: !isOpened});
	}

	render () {
		const props = Object.assign({}, this.props);
		delete props.browser;
		delete props.dispatch;
		delete props.zoomControl;
		return (
			<Button
				id="nevaBrowserZoomControlButton"
				backgroundOpacity="transparent"
				className={css.zoomButton}
				onClick={this.toggleMenu}
				tooltipText={$L('Zoom')}
				open={this.state.isOpened}
				icon="plus"
				size="large"
				{...props}
			/>
		);
	}
}

export default ZoomControl;
