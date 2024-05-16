// Copyright (c) 2023 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global PageView*/

function createView() {
    console.log("[PageViewAdaptor] createView");

    const pageContentsParams = {
        "allow-file-access": true,
        "allow-universal-access": true,
        "api": ["v8/browser_shell_ipc"],
        "partition": "",
        "page-contents-type": "ui"
    };

    const isInSeparatedProcess = window.shell.launchArgs.uioverlay_in_separated_process;
    const isInBrowserRendererProcess = (typeof isInSeparatedProcess) === "undefined" ?
        true : !isInSeparatedProcess;

    if (isInBrowserRendererProcess) {
        const browserPageContents =  shell.shellWindow.pageView.pageContents;
        pageContentsParams["site-page-contents"] = browserPageContents;
    }

    const view = new PageView({"page-contents-params": pageContentsParams});
    window.shell.shellWindow.pageView.addChildView(view);
    view.pageContents.loadFile("uioverlay/index.html");
    view.pageContents.setPageBaseBackgroundColor('#FFFFFF00');
    return view;
}

function applySetVisible({ visible, view }) {
    console.log("[PageViewAdaptor] applySetVisible ", visible);
    view.setVisible(visible);
}

function applyBounds({ bounds, view }) {
    console.log(`[PageViewAdaptor] applyBounds (${bounds.x}, ${bounds.y},
        ${bounds.w}, ${bounds.h})`);

    view.setBounds(
        Math.round(bounds.x),
        Math.round(bounds.y),
        Math.round(bounds.w),
        Math.round(bounds.h)
    );
}

function applyDeactivate({ view }) {
    console.log("[PageViewAdaptor] applyDeactivate");
    try {
        view.pageContents.deactivate();
        window.shell.shellWindow.pageView.removeChildView(view);
    } catch(e) {
        console.error(e);
    }
}

function applySwitchContent({ target, ipc }) {
    console.log("[PageViewAdaptor] applySwitchContent contentName: ", target);
    ipc.post("switchContent", { type: target });
}

export {createView, applySetVisible, applyBounds, applyDeactivate, applySwitchContent};
