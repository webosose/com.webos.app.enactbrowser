import Button from '@enact/agate/Button';
import Input from '@enact/agate/Input';
import Popup from '@enact/agate/Popup';
import React, { Component } from 'react';
import css from './UrlManager.module.less';

class AddURL extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: this.value,
            urlValidation: ''
        };
        this.inputEl = React.createRef();
    }

    onChangeURL = (ev) => {
        this.setState({
            url: ev.value,
            urlValidation: ''
        })
    }
    validateURL = () => {
        const { url } = this.state;
        const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        if (regexp.test(url)) {
            return true;
        }
        else {
            return false;
        }
    }
    addURL = () => {
        if (this.validateURL()) {
            const { url } = this.state;
            this.props.browser.siteFiltering.addUrl(url);
            this.props.onClose();
        } else {
            this.setState({
                urlValidation: "Please enter valid URL."
            })
        }
    }
    render() {
        const { url, urlValidation } = this.state;
        const { onClose } = this.props;
        return (
            <div className={css.container}>
                <div className={css.inputCnt}>
                    <Input type='url' ref={this.inputEl} value={url} onChange={this.onChangeURL} />
                    <p className={css.error}>{urlValidation}</p>
                </div>
                <div className={css.buttonCnt}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={this.addURL}>Add</Button>
                </div>
            </div>
        )
    }
}

export default AddURL;