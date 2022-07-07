// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the PinPopup component.
 *
 */

import $L from "@enact/i18n/$L";
import Button from "@enact/agate/Button";
import Popup from "@enact/agate/Popup";
import Input from "@enact/agate/Input";
import PropTypes from "prop-types";
import React, { Component } from "react";

import css from "./PinPopup.module.less";

class PinPopup extends Component {
  static propTypes = {
    matched: PropTypes.any,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    open: PropTypes.bool,
  };

  static defaultPropTypes = {
    open: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      pinValue: "",
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.matched !== nextProps.matched &&
      nextProps.matched === "correct"
    ) {
      this.onClose();
    }
  }

  onChange = (ev) => {
    if (ev.value.length < 5) {
      this.setState({ pinValue: ev.value });
    }
  };

  onNumberKeyPressed = (ev) => {
    const key = ev.target.textContent;

    if (key === "Back") {
      this.setState((prevState) => ({
        pinValue: prevState.pinValue.slice(0, -1),
      }));
    } else if (this.state.pinValue.length < 4) {
      this.setState((prevState) => ({
        pinValue: prevState.pinValue + key,
      }));
    }
  };

  onSubmitPinCode = (ev) => {
    ev.preventDefault();
    this.props.onSubmit(this.state.pinValue);
  };

  onClose = () => {
    this.setState({ pinValue: "" });
    this.props.onClose();
  };

  render() {
    const { open, matched } = this.props,
      disabledButtons = this.state.pinValue.length === 4;

    return (
      <Popup
        className={css.pinPopup}
        open={open}
        closeButton
        onClose={this.onClose}
        title={matched === "incorrect" ? $L("Check Password") : $L("Enter PIN")}
      >
        <div className={css.titleBelow}>
          {matched === "incorrect"
            ? $L("Incorrect password. Please enter correct password.")
            : $L("Please enter the parental control PIN.")}
        </div>
        <form className={css.form} onSubmit={this.onSubmitPinCode}>
          <Input
            className={css.input}
            dismissOnEnter
            onChange={this.onChange}
            type="number"
            value={this.state.pinValue}
          />
        </form>
        <Button className={css.ok} onClick={this.onSubmitPinCode}>
          {$L("OK")}
        </Button>
        <div className={css.guide}>
          {$L("Use the pointer or number keys in your remote.")}
          <br />
          {$L("Press the back key to erase the number.")}
        </div>
        <br />
        <br />
        {/* <div className={css.buttonSet}> */}
        <Button
          className={css.buttonSet}
          css={css}
          disabled={disabledButtons}
          onClick={this.onNumberKeyPressed}
        >
          0
        </Button>
        <Button
          className={css.buttonSet}
          css={css}
          disabled={disabledButtons}
          onClick={this.onNumberKeyPressed}
        >
          1
        </Button>
        <Button
          className={css.buttonSet}
          css={css}
          disabled={disabledButtons}
          onClick={this.onNumberKeyPressed}
        >
          2
        </Button>
        <Button
          className={css.buttonSet}
          css={css}
          disabled={disabledButtons}
          onClick={this.onNumberKeyPressed}
        >
          3
        </Button>
        <Button
          className={css.buttonSet}
          css={css}
          disabled={disabledButtons}
          onClick={this.onNumberKeyPressed}
        >
          4
        </Button>
        <Button
          className={css.buttonSet}
          css={css}
          disabled={disabledButtons}
          onClick={this.onNumberKeyPressed}
        >
          5
        </Button>
        <Button
          className={css.buttonSet}
          css={css}
          disabled={disabledButtons}
          onClick={this.onNumberKeyPressed}
        >
          6
        </Button>
        <Button
          className={css.buttonSet}
          css={css}
          disabled={disabledButtons}
          onClick={this.onNumberKeyPressed}
        >
          7
        </Button>
        <Button
          className={css.buttonSet}
          css={css}
          disabled={disabledButtons}
          onClick={this.onNumberKeyPressed}
        >
          8
        </Button>
        <Button
          className={css.buttonSet}
          css={css}
          disabled={disabledButtons}
          onClick={this.onNumberKeyPressed}
        >
          9
        </Button>
        <Button
          className={css.buttonSet}
          css={css}
          onClick={this.onNumberKeyPressed}
        >
          Back
        </Button>
        {/* </div> */}
      </Popup>
    );
  }
}

export default PinPopup;
