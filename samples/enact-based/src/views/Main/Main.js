/*global chrome*/
/**
 * Main
 *
 */

import {contextTypes} from '@enact/i18n/I18nDecorator';
import React, {Component} from 'react';

import {Browser} from '../../NevaLib/BrowserModel';

import {BrowserIconButton as IconButton} from '../../components/BrowserIconButton';
import ContentView from '../ContentView';
import ExitFullScreenButton from '../../components/ExitFullScreenButton';
import Menu from '../../components/Menu';
import NavigationBox from '../../components/NavigationBox';
import Omnibox from '../../components/Omnibox';
import {TabBar} from '../../components/TabBar';
import ZoomControl from '../../components/ZoomControl';

import css from './Main.less';

const maxTab = 7;

class Main extends Component {
	static contextTypes = contextTypes;

	constructor (props) {
		super(props);
		let fullScreen = false;
		if (typeof chrome === 'object' && chrome.app.launchArgs) {
			const launchArgs = JSON.parse(chrome.app.launchArgs);
			if (launchArgs.fullMode) {
				fullScreen = true;
			}
		}
		this.state = {
			browser: {},
			fullScreen
		};
	}

	componentDidMount () {
		const browser = new Browser(this.props.store, maxTab);
		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState({browser});
	}

	onFullScreen = () => {
		this.setState({fullScreen: true});
	}

	onExitFullScreen = () => {
		this.setState({fullScreen: false});
	}

	onClose = () => {
		this.state.browser.shutdown();
	}

	render () {
		const
			props = Object.assign({}, this.props),
			{browser, fullScreen} = this.state;

		delete props.store;

		return (
			<div {...props}>
			{
				!fullScreen ? (
					<div>
						<div className={css['flexbox-row']}>
							<NavigationBox browser={browser} />
							<Omnibox browser={browser} />
							<ZoomControl browser={browser} />
							<Menu browser={browser}/>
							<IconButton
								backgroundOpacity="transparent"
								className={css.button}
								onClick={this.onFullScreen}
								tooltipText="Full Screen"
								type="fullscreenButton"
							/>
							{
								(typeof window === 'object' && window.navigator.userAgent.indexOf('SmartTV') > -1) ?
								<IconButton
									backgroundOpacity="transparent"
									className={css.button}
									onClick={this.onClose}
									tooltipText="Exit App"
									type="xButton"
								/> :
								null
							}
						</div>
						<TabBar browser={browser} />
					</div>
				) : null
			}
				<ContentView browser={browser} fullScreen={fullScreen} />
				<ExitFullScreenButton fullScreen={fullScreen} onExitFullScreen={this.onExitFullScreen} />
			</div>
		);
	}
}

export default Main;
