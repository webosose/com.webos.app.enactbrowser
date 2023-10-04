// Copyright (c) 2023 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import React, { useState, useEffect, useCallback } from "react";
import $L from '@enact/i18n/$L';
import Input from '@enact/moonstone/Input';
import {connect} from 'react-redux';
import css from './Omnibox.module.less';
import Spotlight from '@enact/spotlight';

function createSuggestionsList ({urlSuggestions, searchEngine, bookmarksData, value}) {
	let items = [];

	items.push({
		dataIndex: 0,
		icon: "searchButton",
		title: `${searchEngine} ${$L('Search')}`,
		url: value,
		key: 0
	});

	if (urlSuggestions) {
		for (let i = 0; i < urlSuggestions.length; i ++) {
			items.push({
				dataIndex: i + 1,
				icon: bookmarksData.some(
					(bookmark) => bookmark.url === urlSuggestions[i].url
				) ? "bookmarksButton" : "historyButton",
				key: i + 1,
				title: urlSuggestions[i].title,
				url: urlSuggestions[i].url
			});
		}
	}

	return items;
}

function AddressBarBase({url, browser, onUrlChanged, urlSuggestions, searchEngine, bookmarksData, isLoading}) {
	const [value, setValue] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [isActive, setIsActive] = useState(false);

	console.log(`[AddressBar] isActive: ${isActive}, isEditing: ${isEditing}, value: ${value}, isLoading: ${isLoading}`);

	useEffect(() => {
		setValue(url)
	}, [url]);

	useEffect(() => {
		if (isLoading && isEditing) {
			setIsEditing(false);
		}
	}, [isLoading]);

	useEffect(() => {
		const onSuggestionClick = ({clickedIndex}) => {
			console.log(`[AddressBar] click on suggested item message ${clickedIndex}`);

			Spotlight.pause();

			if (clickedIndex === 0) {
				browser.navigate(browser.searchService.getSearchUrl(value));
			} else {
				browser.navigate(urlSuggestions[clickedIndex - 1].url);
			}
			setIsEditing(false);
		}
		window.urlSuggestionsBar.on("click_suggested_item", onSuggestionClick);

		return () => {
			window.urlSuggestionsBar.removeEventListener("click_suggested_item", onSuggestionClick);
		}
	}, [browser, urlSuggestions, value]);

	useEffect(() => {
		const items = createSuggestionsList({urlSuggestions, searchEngine, bookmarksData, value});
		window.urlSuggestionsBar.sendSuggestion(items);
	}, [urlSuggestions, searchEngine, bookmarksData, value]);

	const getSuggestions = useCallback((pattern) => {
		if (browser && browser.mostVisited && browser.mostVisited.getSuggestions) {
			browser.mostVisited.getSuggestions(pattern, 5);
		} else {
			console.warn(`[AddressBar] browser.mostVisited.getSuggestions is not available`);
		}
	});

	const onClick = useCallback((ev) => {
		console.log(`[AddressBar] AddressBar::onClick`);
		getSuggestions(value);
		setIsEditing(value !== "");
		ev.stopPropagation();
	}, [value]);

	const onChange = useCallback((ev) => {
		getSuggestions(ev.value);
		setValue(ev.value);
		onUrlChanged(ev.value);
		setIsEditing(ev.value !== "");
	});

	useEffect(() => {
		console.log(`[AddressBar] show/hide suggestions bar (${isEditing ? "editing" : "not editing"})`);
		const hide = (ev) => {
			if (isEditing) {
				if (ev.target.offsetParent.id !== 'omniboxInput') {
					setIsEditing(false);
				}
			}
		}

		if (isEditing) {
			window.urlSuggestionsBar.show()
				.then(() => {
					window.document.addEventListener('click', hide);
				})
		} else {
			window.document.removeEventListener('click', hide);
			window.urlSuggestionsBar.hide();
		}

		return () => {
			window.document.removeEventListener('click', hide);
		}
	}, [isEditing]);

	const onActivate = useCallback(() => {
		console.log(`[AddressBar] onActivate (value: ${value})`);
		if (value !== "") {
			console.log(`[AddressBar] onActivate::show suggestions bar`);
			setIsEditing(true);
		}
		setIsActive(true);
	}, [value]);

	const onDeactivate = useCallback(() => {
		console.log(`[AddressBar] AddressBar::onDeactivate`);
		setIsActive(false);
	}, []);

	useEffect(() => {
		if (isActive) {
			Spotlight.pause();
		} else {
			Spotlight.resume();
		}
	}, [isActive]);

	return(
		<Input
			id="omniboxInput"
			autoFocus={isEditing}
			className={css.inputBox}
			dismissOnEnter
			onClick={onClick}
			onChange={onChange}
			value={value}
			onActivate={onActivate}
			onDeactivate={onDeactivate}
		/>
	);
}

const mapStateToProps = ({tabsState, bookmarksState, browserState, settingsState}) => {
	const {selectedIndex, ids, tabs} = tabsState;

	if (ids.length > 0) {
		const {navState} = tabs[ids[selectedIndex]];
		if (navState) {
			return {
				isLoading: navState.isLoading,
				bookmarksData: bookmarksState.data,
				searchEngine: settingsState.searchEngine,
				url: navState.url,
				urlSuggestions: browserState.urlSuggestions
			}
		}
	} else {
		return {
			url: '',
		};
	}
};

const AddressBar = connect(mapStateToProps, null)(AddressBarBase);
export default AddressBar;
