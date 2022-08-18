// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global CustomEvent*/

import React, {Component} from 'react';

import SuggestedItem from '../../../../samples/enact-based/src/components/Omnibox/SuggestedItem';

import css from './InputSuggestionList.less'

class InputSuggestionList extends Component {
    constructor (props) {
        super(props);
        this.state = { suggestions: [] };
    }

    componentDidMount() {
        document.addEventListener("suggestionListUpdated", (ev) => {
            this.setState({suggestions: ev.detail});
        });
    }

    onClickSuggestedItems(index) {
        return () => {
            const event = new CustomEvent("clickSuggestedItem", { detail: {
                clickedIndex: index,
            }});
            document.dispatchEvent(event);
        }
    }

    componentDidUpdate() {
        this.props.onUpdate();
    }

    render() {
        let items = [];
        const suggestions = this.state.suggestions;

        for (let i = 0; i < suggestions.length; i ++) {
            const suggestion = suggestions[i];

            items.push(
                <SuggestedItem
                    data-index={suggestion.dataIndex}
                    icon={suggestion.icon}
                    key={suggestion.key}
                    onClick={this.onClickSuggestedItems(suggestion.dataIndex)}
                    title={suggestion.title}
                    url={suggestion.url}
                />
            );
        }

        if (items.length === 0) {
            return <div id="app"/>
        }

        return (
            <div id="app" className={css.itemsContainer} >
                {items}
            </div>);
    }
}

export default InputSuggestionList;
