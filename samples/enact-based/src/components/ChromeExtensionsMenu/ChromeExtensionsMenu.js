// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the ChromeExtensionsMenu component.
 *
 */

import React, { useState, useCallback } from 'react';

import {BrowserIconButton as IconButton} from '../BrowserIconButton';
import css from './ChromeExtensionsMenu.less';

function ChromeExtensionsMenu({chromeExtensionsMenu}) {

	const [isOpened, setIsOpened] = useState(false);

	const onClick = useCallback(() => {
		if (isOpened) {
			chromeExtensionsMenu.hide();
		} else {
			chromeExtensionsMenu.showAbove("nevaBrowserChromeExtensionsButton");
		}
		setIsOpened(!isOpened);
	}, [isOpened])

	return (
		<IconButton
			id="nevaBrowserChromeExtensionsButton"
			backgroundOpacity="transparent"
			className={css.chromeExtensionsMenuButton}
			onClick={onClick}
			open={isOpened}
			type="extensionButton"
		/>
	);
}

export default ChromeExtensionsMenu;
