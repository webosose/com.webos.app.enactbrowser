// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the WebView component.
 *
 */
/* global shell */

import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Component} from 'react';
import ErrorPage from '../ErrorPage';
import BlockedPageNotification from '../BlockedPageNotification';
import {setFullScreen, setWebContentFullscreen} from 'js-browser-lib/ReduxComponents/actions';

import css from './WebView.module.less';

const
	WebViewWrapperId = '_webview',
	DialogSupressTimeout = 30000;


class WebViewBase extends Component {
	static propTypes = {
		id: PropTypes.string,
		webView: PropTypes.object
	}

	constructor (props) {
		super(props);

		this.state = {
			load_commited: false, // load has commited
			show_error_page: false, // show error page, blocked page info (or webview) on next rendering
			show_blocked_page_notification: false,
			load_started: false,
			load_stopped: false,
			show_webview: false,
			show_error_dialog: false,
			suppressDialog: false,
			state: "navigating",
			post_render_task: null,
			vkbHeight: 0,
			webContentFullscreen: false,
		};

		if (typeof shell !== "undefined") {
			shell.shellWindow.on('vkb-overlap', ({height}) => {
				console.log(`vkb-overlap ${height}`);
				this.setState({vkbInset: height});
				this.props.webView.tabView.pageContents.scrollByY(height);
			});
			shell.shellWindow.on('vkb-change-state', (isShown) => {
				console.log(`'vkb-change-state ${isShown}`);
				if (!isShown) {
					this.props.webView.tabView.pageContents.scrollByY(-this.state.vkbInset);
					this.setState({vkbInset: 0});
				}
			});
		}
	}

	static getDerivedStateFromProps = (nextProps, prevState) => {
		try {
			let
				{browser, id, tabs} = nextProps,
				{state} = prevState,
				error = tabs[id].error;

			let state_set = Object.assign({}, prevState);

			state_set.show_webview = false;
			state_set.show_error_page = false;
			state_set.show_blocked_page_notification = false;
			state_set.show_error_dialog = false;

			if (error !== null) {
				if (nextProps.webView.activeState === 'deactivated') {
					state = "deactivated";
				} else {
					state = "showing_error";
				}
			}

			switch (state) {
				case "navigating": {
					if (!browser.settings.getUseJSErrorPage()) {
						state_set.show_webview = true;
					}
					break;
				}

				case "loading_site": {
					state_set.show_webview = true;
					break;
				}

				case "showing_error": {

					switch (error) {
						case 'PAGE_UNRESPONSIVE':
							state_set.show_error_dialog = true;
							state_set.show_webview = true;
							state_set.show_error_page = true;
							break;

						case 'RENDERER_CRASHED':
							state_set.show_error_page = true;
							break;

						case 'ERR_BLOCKED_BY_CLIENT':
						case 'ERR_BLOCKED_BY_SITEFILTER':
							state_set.show_blocked_page_notification = true;
							break;

						default:
							if (browser.settings.getUseJSErrorPage()) {
								state_set.show_error_page = true;
							} else {
								state_set.show_webview = true;
							}
							break;
					}
					break; // case: "showing_error"
				}

				case "deactivated":
					state_set.show_webview = false; // when 'stop' pressed in 'unresponsive' dialog
					state_set.show_error_page = true;
					break;

				case "showing_site": {
					state_set.show_webview = true;
					break;
				}
			} // switch

			if (JSON.stringify(state_set) !== JSON.stringify(prevState)) {
				return state_set;
			} else {
				return null;
			}
		} catch (e) {
			console.error(e);
		}
		return null;
	}

	isOnlyForBuiltInErrorPage = (err) => {
		return ['PAGE_UNRESPONSIVE','RENDERER_CRASHED'].includes(err);
	};

	MaybeLoadingStarted = () => {
		let err = this.props.tabs[this.props.id].error;
		if (this.state.load_commited === true && this.state.load_started === true) {
			if (err === null) {
				this.setState({state: "loading_site"});
			} else { // error`
				if (this.isOnlyForBuiltInErrorPage(err)) {
					this.setState({state: "showing_builtin_error_page"});
				} else if (err === 'ERR_BLOCKED_BY_CLIENT') {
					this.setState({state: "showing_blocked_notification"});
				} else {
					this.setState({state: "showing_error"});
				}
			}

			this.setState({load_started: false});
			this.setState({load_commited: false});
			this.setState({load_stopped: false});
		}
	}

	onLoadCommit = () => {
		this.setState({load_commited: true});
		this.MaybeLoadingStarted();
	}

	onLoadStart = () => {
		this.setState({load_started: true});
		if (this.state.state === "showing_site") {
			this.setState({state: "navigating"});
		}
		this.MaybeLoadingStarted();
	}

	onLoadStop = () => {
		this.setState({load_started: false});
		this.setState({load_commited: false});
		this.setState({load_stopped: true});

		if (this.props.tabs[this.props.id].error === null) {
			this.setState({state: "showing_site"});
		} else {
			this.setState({state: "showing_error"});
		}
	}

	onNavigate = (ev) => {
		this.setState({state: "navigating"}, ev.detail.call_after_render);
	}

	componentDidMount () {
		setTimeout(() => { this.setState({ state: "showing_site" }); });
		this.props.webView.insertIntoDom(this.props.id + WebViewWrapperId);
		this.props.webView.addEventListener('load-progress-changed', this.onLoadCommit);
		this.props.webView.addEventListener('did-start-loading', this.onLoadStart);
		this.props.webView.addEventListener('did-stop-loading', this.onLoadStop);
		this.props.webView.addEventListener('navigate', this.onNavigate);
		this.props.webView.addEventListener('needToUpdateUI', this.onUINeedsToBeUpdated);
		this.props.webView.addEventListener('enter-html-fullscreen', this.enableFullScreen.bind(this));
		this.props.webView.addEventListener('leave-html-fullscreen', this.disableFullScreen.bind(this));
	}

	componentDidUpdate () {
		console.log(`views::WebView::componentDidUpdate`);
		this.props.webView.adjustBounds(this.state.webContentFullscreen ? "main_view" : this.props.id + WebViewWrapperId)
		this.props.webView.focus();
	}

	onWait = () => {
		this.setState({suppressDialog: true});

		const releaseDialog = () => {
			this.setState({suppressDialog: false});
		};
		setTimeout(releaseDialog, DialogSupressTimeout);
	}

	onStop = () => {
		this.props.webView.deactivate();
		this.setState({show_error_dialog: false});
		this.setState({state: "deactivated"});
	}

	openSiteFiltering = () => {
		this.props.browser.openSettings();
	}

	onUINeedsToBeUpdated = () => {
		console.log(`onUINeedsToBeUpdated`);
		this.forceUpdate();
	}

	enableFullScreen() {
		console.log(`WebView::enableFullScreen`);
		this.setState({webContentFullscreen: true});
		this.props.setWebContentFullscreen(true);
	}

	disableFullScreen() {
		console.log(`WebView::disableFullScreen`);
		this.setState({webContentFullscreen: false});
		this.props.setWebContentFullscreen(false);
	}

	render () {
		let {id, tabs, style, ...rest} = this.props,
			{show_error_page, show_webview} = this.state,
			{show_blocked_page_notification} = this.state,
			err = tabs[id].error,
			id_ = id + WebViewWrapperId;

		delete rest.webView;
		delete rest.browser;

		const view_page =
			<div className={css.webViewContainer} style={
				show_webview ? {height: '100%'} : {}
			}>
				<div
					className={style}
					id={id_}
					hidden={!show_webview}
					{...rest}
				/>
				<div style={{minHeight: `${this.state.vkbInset}px`}}/>
			</div>

		const error_page =
			<ErrorPage
				id={id_ + "errorPage"}
				style={style}
				errorMsg={err}
				show_error_dialog={false}
				onWait={this.onWait}
				onStop={this.onStop}
				hidden={!show_error_page}
			/>;

		const blocked_page_notification =
			<BlockedPageNotification
				id={id_ + "blockedPage"}
				style={style}
				onOpenSiteFiltering={this.openSiteFiltering}
				hidden={!show_blocked_page_notification}
			/>;

		return (
			<div className={css.contentViewContainer}>
				{view_page}
				{error_page}
				{blocked_page_notification}
			</div>
		);
	}
}


const mapDispatchToProps = (dispatch) => {
	return ({
		setFullScreen: (enable) => dispatch(setFullScreen(enable)),
		setWebContentFullscreen: (enable) => dispatch(setWebContentFullscreen(enable))
})};

const WebView = connect(null, mapDispatchToProps)(WebViewBase);

export default WebView;
