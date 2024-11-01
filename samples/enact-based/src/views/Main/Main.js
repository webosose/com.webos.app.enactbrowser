// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/* global chrome*/
/**
 * Main
 *
 */

import $L from "@enact/i18n/$L";
import contextTypes from "@enact/i18n/I18nDecorator";
import Button from "@enact/agate/Button";
import Spotlight from "@enact/spotlight";
import React, { Component } from "react";
import PropTypes from "prop-types";
import TooltipDecorator from "@enact/agate/TooltipDecorator";

import { Browser, TabTypes } from "../../NevaLib/BrowserModel";

import ContentView from "../ContentView";
import DialogView from "../DialogView";
import Dialog from "../../components/Dialog";
import Menu from "../../components/Menu";
import NavigationBox from "../../components/NavigationBox";
import Omnibox from "../../components/Omnibox";
import Share from "../../components/Share";
import { TabBar } from "../../components/TabBar";
import ZoomControl from "../../components/ZoomControl";
import { connect } from 'react-redux';
import { set_allow_media_popup } from '../../NevaLib/Popup/actions';
import PopupComponent from '../../components/Popup/Popup'
import css from "./Main.module.less";
import PWAButton from '../../components/PWAButton';

const TooltipButton = TooltipDecorator(
  { tooltipDestinationProp: "decoration" },
  Button
);

const maxTab = 7;

class Main extends Component {
  static contextTypes = contextTypes;

  static propTypes = {
    store: PropTypes.any,
  };

  constructor(props) {
    super(props);

    this.state = {
      browser: {},
      dialog: null,
      fullScreen: false,
      domain: null,
      detectedMedia: null,
    };

    this.fullScreenContentItem = React.createRef();
    if (typeof chrome === "object" && chrome.app.launchArgs) {
      const launchArgs = JSON.parse(chrome.app.launchArgs);
      if (launchArgs.fullMode) {
        this.state.fullScreen = true;
      }
    }
  }

  componentDidMount() {
    //Event listener "detectMedia" function is registered for listening to media detection event.
    window.navigator.userpermission.onshowprompt = this.detectMedia;

    const browser = new Browser(this.props.store, maxTab);
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ browser });

    document.addEventListener("dialog", this.onDialog);
    document.addEventListener("keydown", ({ keyCode }) => {
      if (keyCode === 0x1cd) {
        browser.back();
      }
    });

    document.addEventListener("webOSRelaunch", this.onRelaunch);
    document.addEventListener("webOSLocaleChange", this.onLocaleChange);
    document.addEventListener("shiftContent", this.onShiftContent);
  }

  detectMedia = (ev, ev1) => {
    console.log("detected media details are...==>", ev, ev1)
    let detectedMedia = ev1.includes(3) ? (ev1.includes(9) ? 'camera-mic' : 'camera') : ev1.includes(9) ? 'mic' : null
    if (ev1.includes(7)) {
      if (detectedMedia === null) {
        detectedMedia = "geolocation";
      }
      else {
        detectedMedia += "-geolocation";
      }
    }
    console.log("detectedMedia is ===> ", detectedMedia)
    this.setState({
      domain: ev,
      detectedMedia,
    })
    this.props.set_allow_media_popup(true)
  }

  componentDidUpdate() {
    const selectedWebview = this.getSelectedWebview();

    if (selectedWebview) {
      Spotlight.pause();
      selectedWebview.focus();
    } else {
      Spotlight.resume();
    }
  }

  componentWillUnmount() {
    document.removeEventListener("webOSRelaunch");
  }

  getSelectedWebview = () => {
    const { browser } = this.state,
      selectedId = browser.tabs.getSelectedId();

    if (browser.webViews[selectedId]) {
      return browser.webViews[selectedId];
    } else {
      return null;
    }
  };

  onDialogClose = () => {
    this.setState({ dialog: null });
  };

  onDialog = (ev) => {
    ev.preventDefault();
    this.setState({ dialog: ev });
  };

  onFullScreen = () => {
    this.setState({ fullScreen: true });
  };

  onExitFullScreen = () => {
    this.setState({ fullScreen: false });
  };

  onClick = () => {
    Spotlight.resume();
  };

  onMouseLeave = () => {
    if (this.getSelectedWebview()) {
      Spotlight.pause();
    } else if (document.activeElement.tagName !== "INPUT") {
      Spotlight.resume();
    }
  };

  onRelaunch = (ev) => {
    if (ev.detail) {
      if (
        (typeof ev.detail.url === "string" && ev.detail.url !== "") ||
        (typeof ev.detail.uri === "string" && ev.detail.uri !== "")
      ) {
        let url = ev.detail.url ? ev.detail.url : ev.detail.uri;
        const { browser } = this.state,
          numOfTabs = browser.tabs.count();

        url = browser.searchService.possiblyUrl(url)
          ? url
          : browser.searchService.getSearchUrl(url);

        if (numOfTabs < browser.tabs.maxTabs) {
          browser.createTab(TabTypes.WEBVIEW, url);
        } else {
          browser.navigate(url);
        }
      }
    }
  };

  onLocaleChange = () => {
    console.log("Main Locale Changed. Called forceUpdate");
    setTimeout(() => {
      this.forceUpdate();
      setTimeout(() => {
        this.state.browser.reloadStop();
      }, 1000);
    }, 1000);
  };

  onShiftContent = (ev) => {
    const height = ev.detail;
    if (height > 0) {
      this.shiftWebView(height);
    } else {
      this.restoreWebView();
    }
  };

  shiftWebView = (height) => {
    var selectedWebview = this.getSelectedWebview();
    if (!selectedWebview) {
      return;
    }
    let script = `
			if (typeof document_style_transform_backup == "undefined")
				var document_style_transform_backup = document.body.style.transform;
			document.body.style.transform = document.body.style.transform + "translateY(-${height}px)";
		`;
    selectedWebview.executeScript({ code: script });
  };

  restoreWebView = () => {
    const selectedWebview = this.getSelectedWebview();
    if (!selectedWebview) {
      return;
    }
    let script = `
			if (typeof document_style_transform_backup != "undefined")
				document.body.style.transform = document_style_transform_backup;
		`;
    selectedWebview.executeScript({ code: script });
  };

  renderMediaPopup = () => (
    <>
      <PopupComponent />
    </>
  );

  render() {
    const props = Object.assign({}, this.props),
      { browser, dialog, fullScreen, domain, detectedMedia } = this.state;

    delete props.store;

    return (
      <div {...props}>
        <div onClick={this.onClick} onMouseLeave={this.onMouseLeave}>
          {fullScreen === false && (
            <div className={css["flexbox-row"]}>
              <NavigationBox browser={browser} />
              <Share />
              <Omnibox browser={browser} domain={domain} detectedMedia={detectedMedia} />
              <ZoomControl browser={browser} />
              <Menu browser={browser} />
              {browser.webViews ?
                <PWAButton webViews={browser.webViews} />
                : null
              }
              <TooltipButton
                className={css.fullscreen}
                css={css}
                onClick={this.onFullScreen}
                icon="fullscreen"
                tooltipText={$L("Full screen")}
                size="small"
              />
            </div>
          )}
          <TabBar fullScreen={fullScreen} browser={browser} />
        </div>
        <ContentView
          browser={browser}
          ref={this.fullScreenContentItem}
          onExitFullScreen={this.onExitFullScreen}
          fullScreen={fullScreen}
        />
        {dialog ? (
          <Dialog
            dialog={dialog}
            onOK={this.onDialogClose}
            onCancel={this.onDialogClose}
          />
        ) : null}
        {fullScreen === false && <DialogView />}
      </div>
    );
  }
}

const mapStateToProps = ({ popupState }) => ({
  allow_media_popup: popupState.allow_media_popup
});

const mapDispatchToProps = (dispatch) => ({
  set_allow_media_popup: (data) => dispatch(set_allow_media_popup(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
