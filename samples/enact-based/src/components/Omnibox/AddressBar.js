// Copyright 2023 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useState, useEffect, useCallback } from "react";
import $L from '@enact/i18n/$L';
import {Input as InputBase} from '@enact/agate/Input';
import Spotlight from '@enact/spotlight';
import {connect} from 'react-redux';

import css from './Omnibox.module.less';

class Input extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return <InputBase style={{maxWidth: "100%"}} {...this.props} />
	}
};

function createSuggestionsList ({urlSuggestions, searchEngine, bookmarksData, value}) {
	let items = [];

	items.push({
		dataIndex: 0,
		icon: "search2",
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
				) ? "bookmark" : "history",
				key: i + 1,
				title: urlSuggestions[i].title,
				url: urlSuggestions[i].url
			});
		}
	}

	return items;
}

function AddressBarBase({
	url, browser, onUrlChanged, urlSuggestions, searchEngine, bookmarksData, isLoading, browserLoadingCompleted
}) {
	const [value, setValue] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [isActive, setIsActive] = useState(false);

	console.log(`[AddressBar] isActive: ${isActive}, \
isEditing: ${isEditing}, \
value: ${value}, \
isLoading: ${isLoading}, \
browserLoadingCompleted: ${browserLoadingCompleted}`);

	useEffect(() => {
		if (/^chrome-extension:\/\/[a-z]{32}\/http(s?):\/\/.+\.pdf$/i.test(url)) {
			setValue(url.split(/^chrome-extension:\/\/[a-z]{32}\//)[1]);
		} else {
			setValue(url);
		}
	}, [url]);

	useEffect(() => {
		if (isLoading && isEditing) {
			setIsEditing(false);
		}
	}, [isLoading, isEditing]);

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
		window.urlSuggestionsBar.provideSuggestions(items);
	}, [urlSuggestions, searchEngine, bookmarksData, value]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const getSuggestions = useCallback((pattern) => {
		if (browser && browser.mostVisited && browser.mostVisited.getSuggestions) {
			browser.mostVisited.getSuggestions(pattern, 5);
		} else {
			console.warn(`[AddressBar] browser.mostVisited.getSuggestions is not available`);
		}
	});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const onClick = useCallback((ev) => {
		console.log(`[AddressBar] AddressBar::onClick`);
		getSuggestions(value);
		setIsEditing(value !== "");
		ev.stopPropagation();
		window.document.dispatchEvent(new Event("click"));
	}, [value, getSuggestions]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const onChange = useCallback((ev) => {
		getSuggestions(ev.value);
		setValue(ev.value);
		onUrlChanged(ev.value);
		setIsEditing(ev.value !== "");
	});

	useEffect(() => {
		console.log(`[AddressBar] show/hide suggestions bar (${isEditing ? "editing" : "not editing"})`);
		const hide = (ev) => {
			console.log("[AddressBar] click event");
			if (isEditing) {
				if (!(ev.target && ev.target.offsetParent && ev.target.offsetParent.id === 'omniboxInput')) {
					setIsEditing(false);
					window.urlSuggestionsBar.hide();
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
			css={css}
			id="omniboxInput"
			autoFocus={isEditing}
			className={css.inputBox}
			dismissOnEnter
			onClick={onClick}
			onChange={onChange}
			value={value}
			onActivate={onActivate}
			onDeactivate={onDeactivate}
			disabled={!browserLoadingCompleted}
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
				urlSuggestions: browserState.urlSuggestions,
				browserLoadingCompleted: browserState.browserLoadingCompleted
			}
		}
	} else {
		return {
			url: '',
			browserLoadingCompleted: browserState.browserLoadingCompleted
		};
	}
};

const AddressBar = connect(mapStateToProps, null)(AddressBarBase);
export default AddressBar;
