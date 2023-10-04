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

import React, { useState, useCallback, useEffect } from 'react';

import {BrowserIconButton as IconButton} from '../BrowserIconButton';
import css from './ChromeExtensionsMenu.module.less';

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

	useEffect(() => {
		if (isOpened) {
			if (typeof window !== 'undefined') {
				window.document.addEventListener('click', () => {
					console.log(`ChromeExtensionsMenu::on document click event`);
					if (isOpened) {
						setIsOpened(false);
					}
				}, {once: true});
			}
		} else {
			chromeExtensionsMenu.hide();
		}
	}, [isOpened]);

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
