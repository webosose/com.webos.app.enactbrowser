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

	const onClick = useCallback(() => {
		if (isOpened) {
			chromeExtensionsMenu.hide()
				.then(() => {
					setIsOpened(false);
				})
		} else {
			chromeExtensionsMenu.showAbove(extBtnRef.current)
				.then(() => {
					setIsOpened(true);
				})
		}
	}, [isOpened, chromeExtensionsMenu, extBtnRef]);

	const onDocumentClick = useCallback((ev) => {
		const extensionMenuElement = window.document.getElementById('chromeExtensionsMenu');
		const isClickOutside = !extensionMenuElement || !extensionMenuElement.contains(ev.target);
		console.log(`[ChromeExtensionsMenu] onDocumentClick`, {target: ev.target, isClickOutside});
		if (isClickOutside) {
			chromeExtensionsMenu.hide().then(() => {
				setIsOpened(false);
			});
		}
	}, [chromeExtensionsMenu, extBtnRef]);

	const addClickListeners = () => {
		window.document.addEventListener('click', onDocumentClick);
		if (chromeExtensionsMenu && chromeExtensionsMenu.ipc) {
			chromeExtensionsMenu.ipc.ipcObject.once("click", onDocumentClick);
		}
	}

	const removeClickListeners = () => {
		window.document.removeEventListener('click', onDocumentClick);
		if (chromeExtensionsMenu && chromeExtensionsMenu.ipc) {
			chromeExtensionsMenu.ipc.ipcObject.removeEventListener("click", onDocumentClick);
		}
	}

	useEffect(() => {
		if (isOpened) addClickListeners();
		return () => removeClickListeners();
	}, [isOpened]);

	useEffect(() => {
		if (browser.setExtensionButtonRef) {
			browser.setExtensionButtonRef(extBtnRef);
		}
	}, [extBtnRef, browser]);

	return (
		<div ref={extBtnRef}>
			<Button
				id="chromeExtensionsMenu"
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
