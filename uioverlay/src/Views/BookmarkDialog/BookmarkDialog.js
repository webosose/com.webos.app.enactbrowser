// Copyright (c) 2024 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import $L from '@enact/i18n/$L';
import Button from '@enact/agate/Button';
import React, { Component } from 'react';

import css from './BookmarkDialog.module.less';

const initState = {
    addBookmarkCompleted: false,
    addBookmarkToHome: false,
    removeBookmarkCompleted: false,
};

class BookmarkDialog extends Component {

    constructor(props) {
        super(props);
        this.state = initState;
    }

    onUpdateState = (ev) => {
        const {addBookmarkCompleted, addBookmarkToHome, removeBookmarkCompleted} = ev.detail;
        if (addBookmarkCompleted || addBookmarkToHome || removeBookmarkCompleted) {
            this.setState({...initState, ...ev.detail});
        }
    }

    componentDidMount() {
        document.addEventListener('showBookmarkDialogEvent', this.onUpdateState);
    }

    componentDidUpdate() {
        this.props.onUpdate();
    }

    componentWillUnmount() {
        document.removeEventListener('showBookmarkDialogEvent', this.onUpdateState);
    }

    onBookmarkHomeAdd = (state) => () => {
        this.props.model.click(state);
        this.setState({...initState, addBookmarkCompleted: true});
    }

    render() {
        return (
            <div className={css.bookmarkWrap}>
                <div className={css.bookmarkInner}>
                {this.state.addBookmarkCompleted ? (
                    <span>{$L('Bookmark has been added.')}</span>
                ) : this.state.removeBookmarkCompleted ? (
                    <span>{$L('Bookmark has been deleted.')}</span>
                ) : this.state.addBookmarkToHome ?
                    (
                        <>
                            <p>{$L('You can add your bookmark to Home screen and access your favorite website by pressing the icon. Do you want to add the bookmark to Home?')}</p>
                            <div className={css.buttonGrp}>
                                <Button className={css.button} onClick={this.onBookmarkHomeAdd(false)}>{$L('NO')}</Button>
                                <Button className={css.button} onClick={this.onBookmarkHomeAdd(true)}>{$L('YES')}</Button>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        );
    }
}

export default BookmarkDialog;
