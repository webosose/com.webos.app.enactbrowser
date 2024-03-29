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
 * Contains the declaration for the ZoomControl component.
 *
 */

import $L from '@enact/i18n/$L';
import Button from '@enact/agate/Button';
import {isWindowReady} from '@enact/core/snapshot';
import {Component} from 'react';
import {connect} from 'react-redux';
import Ipc from 'js-browser-lib/ipc';
import {TabTypes} from 'js-browser-lib/tabs-consts';

import css from './ZoomControl.module.less';

class ZoomControlBase extends Component {
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

	componentDidUpdate(_, prevState) {
		if (prevState.isOpened !== this.state.isOpened) {
			if (this.state.isOpened) {
				window.document.addEventListener('click', this.onClickListener);
			} else {
				window.document.removeEventListener('click', this.onClickListener);
			}
		}
	}

	componentWillUnmount() {
		if (this.state.isOpened) {
			this.props.zoomControl.hide();
			window.document.removeEventListener('click', this.onClickListener);
		}
	}

	onClickListener = (event) => {
		const zoomControlElement = window.document.getElementById('nevaBrowserZoomControlButton');
		const isClickOutside = !zoomControlElement || !zoomControlElement.contains(event.target);
		const isOpened = this.state.isOpened;
		console.log(`[ZoomControl] onClickListener`, {target: event.target, isOpened, isClickOutside});
		if (isClickOutside && isOpened) {
			this.props.zoomControl.hide();
			this.setState({isOpened: false});
		}
	}

	getZoomFactor = () => {
		let zoomFactor = 1;
		try {
			const tabs = this.props.browser.tabs;
			const selectedTabId = tabs.getSelectedId();
			const webView = this.props.browser.webViews[selectedTabId];

			zoomFactor = webView.zoomFactor;
		} catch(e) {
			console.error(e);
		}
		console.log('[ZoomControl] selected tab zoomFactor: ', zoomFactor);
		return zoomFactor;
	}

	toggleMenu = () => {
		if (!this.props.browser.isWebViewTabSelected()) {
			console.log(`[ZoomControl] Zoom menu will not be shown because no webview tab selected.`);
			return;
		}
		const isOpened = this.state.isOpened;
		console.log(`[ZoomControl] toggleMenu isOpened = `, isOpened);
		if (this.state.isOpened) {
			this.props.zoomControl.hide();
			this.setState({isOpened: false});
		} else {
			this.props.browser.sendZoomFactorToZoomMenu();
			this.props.zoomControl.showAbove("nevaBrowserZoomControlButton", {
				zoomFactor: this.getZoomFactor()
			}).then(() => {
				this.setState({isOpened: true});
			});
		}
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

const mapStateToProps = ({tabsState}) => {
	const {selectedIndex, ids, tabs} = tabsState;
	const disabled = !ids.length || tabs[ids[selectedIndex]].type !== TabTypes.WEBVIEW;
	return {disabled};
};

const ZoomControl = connect(mapStateToProps, null)(ZoomControlBase);

export default ZoomControl;
