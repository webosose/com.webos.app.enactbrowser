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

import { useState, useCallback, useEffect, useRef } from 'react';

import Button from '@enact/agate/Button';
import css from './ChromeExtensionsMenu.module.less';

function ChromeExtensionsMenu({chromeExtensionsMenu, browser}) {
	const extBtnRef = useRef(null);
	const [isOpened, setIsOpened] = useState(false);

	// eslint-disable-line react-hooks/exhaustive-deps
	const onClick = useCallback((event) => {

		const clickEventListener = () => {
			console.log(`ChromeExtensionsMenu::on document click event`);
			chromeExtensionsMenu.hide()
				.then(() => {
					setIsOpened(false);
				});
		}

		const addClickEventListener = () => {
			if (typeof window !== 'undefined') {
				window.document.addEventListener('click', clickEventListener);
			}
		}

		const removeClickEventListener = () => {
			if (typeof window !== 'undefined') {
				window.document.removeEventListener('click', clickEventListener);
			}
		}

		event.stopPropagation();
		if (isOpened) {
			chromeExtensionsMenu.hide()
				.then(() => {
					removeClickEventListener();
					setIsOpened(false);
				})
		} else {
			chromeExtensionsMenu.showAbove(extBtnRef.current)
				.then(() => {
					addClickEventListener();
					setIsOpened(true);
				})
		}
	}, [isOpened, chromeExtensionsMenu, extBtnRef]);

	useEffect(() => {
		if (browser.setExtensionButtonRef) {
			browser.setExtensionButtonRef(extBtnRef);
		}
	}, [extBtnRef, browser]);

	return (
		<div ref={extBtnRef}>
			<Button
				backgroundOpacity="transparent"
				className={css.chromeExtensionsMenuButton}
				onClick={onClick}
				open={isOpened}
				size={"large"}
				icon={"install"}
			/>
		</div>
	);
}

export default ChromeExtensionsMenu;
