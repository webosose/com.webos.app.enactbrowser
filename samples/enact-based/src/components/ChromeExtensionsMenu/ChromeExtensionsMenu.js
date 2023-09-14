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

import { useState, useCallback, useEffect } from 'react';

import Button from '@enact/agate/Button';
import css from './ChromeExtensionsMenu.module.less';

function ChromeExtensionsMenu({chromeExtensionsMenu}) {

	const [isOpened, setIsOpened] = useState(false);

	// eslint-disable-line react-hooks/exhaustive-deps
	const onClick = useCallback((event) => {
		event.stopPropagation();
		if (isOpened) {
			chromeExtensionsMenu.hide();
		} else {
			chromeExtensionsMenu.showAbove("nevaBrowserChromeExtensionsButton");
		}
		setIsOpened(!isOpened);
	}, [isOpened, chromeExtensionsMenu])

	useEffect(() => {
		if (isOpened) {
			if (typeof window !== 'undefined') {
				// eslint-disable-next-line no-unused-vars
				window.document.addEventListener('click', (event) => {
					console.log(`ChromeExtensionsMenu::on document click event`);
					if (isOpened) {
						setIsOpened(false);
					}
				}, {once: true});
			}
		} else {
			chromeExtensionsMenu.hide();
		}
	}, [isOpened, chromeExtensionsMenu]);

	return (
		<Button
			id="nevaBrowserChromeExtensionsButton"
			backgroundOpacity="transparent"
			className={css.chromeExtensionsMenuButton}
			onClick={onClick}
			open={isOpened}
			size={"large"}
			icon={"install"}
		/>
	);
}

export default ChromeExtensionsMenu;
