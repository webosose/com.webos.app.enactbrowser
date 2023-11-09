// Copyright (c) 2018-2020 LG Electronics, Inc.
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

import Button from "@enact/agate/Button";
import ContextualPopupDecorator from "@enact/agate/ContextualPopupDecorator";
import Picker from "@enact/agate/Picker";
import kind from "@enact/core/kind";
import $L from "@enact/i18n/$L";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import TooltipDecorator from "@enact/agate/TooltipDecorator";

import { TabTypes } from "../../NevaLib/BrowserModel";

import css from "./ZoomControl.module.less";

const ZoomIconButton = kind({
  name: "ZoomIconButton",
  render: (props) => (
    <TooltipButton
      {...props}
      icon="plus"
      tooltipText={$L("Zoom")}
      size="small"
    />
  ),
});

const ZoomPopupButton = ContextualPopupDecorator(ZoomIconButton);
const TooltipButton = TooltipDecorator(
  { tooltipDestinationProp: "decoration" },
  Button
);

const zoomLabels = ["300%", "250%", "200%", "150%", "125%", "100%", "75%"],
  zoomFactors = [3, 2.5, 2, 1.5, 1.25, 1, 0.75];

console.log("css is ===> ", css);
class ZoomControlBase extends Component {
  static propTypes = {
    browser: PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpened: false,
      zoom: zoomFactors.indexOf(
        props.browser.zoomFactor ? props.browser.zoomFactor : 1
      ),
    };
  }

  componentDidMount() {
    window.addEventListener("message", (ev) => {
      if (ev.data && ev.data.event === 'click' && ev.data.rootUrl === ev.origin && this.state.isOpened)
        this.setState({ isOpened: false })
    });
  }

  renderPopup = () => (
    <div>
      <Picker
        className={css.picker}
        css={css}
        orientation="vertical"
        onChange={this.onChange}
        skinVariants={{ night: false }}
        value={this.state.zoom}
      >
        {zoomLabels}
      </Picker>
    </div>
  );

  onChange = (ev) => {
    this.props.browser.setZoom(zoomFactors[ev.value]);
    this.setState({ zoom: ev.value });
  };

  toggleMenu = () => {
    const isOpened = !this.state.isOpened;
    setTimeout(() => {
      this.setState({ isOpened });
    }, 100);
  };

  closeMenu = () => {
    this.setState({ isOpened: false });
  };

  render() {
    const props = Object.assign({}, this.props);
    delete props.browser;
    delete props.dispatch;

    return (
      <ZoomPopupButton
        className={css.zoomPopupButton}
        css={css}
        onClick={this.toggleMenu}
        onClose={this.closeMenu}
        open={this.state.isOpened}
        popupComponent={this.renderPopup}
        tooltipText={$L("Zoom")}
        {...props}
      />
    );
  }
}

const mapStateToProps = ({ tabsState }) => {
  const { selectedIndex, ids, tabs } = tabsState;

  if (ids.length > 0) {
    return {
      disabled: tabs[ids[selectedIndex]].type !== TabTypes.WEBVIEW,
    };
  } else {
    return {
      disabled: true,
    };
  }
};

const ZoomControl = connect(mapStateToProps, null)(ZoomControlBase);

export default ZoomControl;
