// Copyright 2022 LG Electronics, Inc.
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

import {Component} from 'react';

import SuggestedItem from '../../../../samples/enact-based/src/components/Omnibox/SuggestedItem';

import css from './InputSuggestionList.module.less'

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
            return <div/>
        }

        return (
            <div className={css.itemsContainer} >
                {items}
            </div>);
    }
}

export default InputSuggestionList;
