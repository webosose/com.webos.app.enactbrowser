// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import kind from "@enact/core/kind";
import ThemeDecorator from "@enact/agate/ThemeDecorator";
import React from "react";

import Main from "../views/Main";

import AppDecorator from "./AppDecorator";

import css from "./App.module.less";
// import UrlManager from '../components/UrlManager/UrlManager';

console.log("css is ==>", css);
const App = kind({
  name: "App",

  styles: {
    css,
    className: "app",
  },

  render: (props) => (
    <Main {...props} className={css.app} />
    // <UrlManager/>
  ),
});

export default AppDecorator(ThemeDecorator(App));
