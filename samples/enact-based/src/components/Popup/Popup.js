// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the Popup component.
 *
 */
import $L from '@enact/i18n/$L';
import Button from '@enact/agate/Button';
import React, { Component } from 'react';
import css from './Popup.module.less';
import Icon from '@enact/agate/Icon';
import camera from '../../../assets/popup/camera.webp';
import microphone from '../../../assets/popup/microphone.png';
import geolocation from '../../../assets/popup/geolocation.png';
import { connect } from 'react-redux';
import { set_allow_media_popup } from '../../NevaLib/Popup/actions';

class Popup extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    //User given permission is sent to API. 0-error, 1-allow, 2-block,3-close
    handlePermissions = (data) => {
        console.log("PERMISSION IS ==> ", data)
        let result = window.navigator.userpermission.onpromptresponse(data)
        console.log("final returned value is ===>", result)
        this.props.set_allow_media_popup(false)
    }

    //closes the popUp by dispatching an action to the store
    handleClose = () => {
        console.log("handleClose function entered ==> Popup.js")
        this.props.set_allow_media_popup(false)
        //calls API to send the close event
        window.navigator.userpermission.onpromptresponse(3)
    }

    render() {
        const { domain, detectedMedia } = this.props;

        if (domain && detectedMedia) {
            return (
                <>
                    <div className={css.NotificationPopup}>
                        <div>{this.props.domain} wants to
                            <Icon
                                onClick={this.handleClose}
                                className={css.closeIcon} css={css}
                            >closex</Icon>
                        </div>
                        {(detectedMedia === 'camera' || detectedMedia == 'camera-mic') && <div><span className={css.alignText}><img src={camera} width={25} height={25} /></span>Use your camera</div>}
                        {(detectedMedia === 'mic' || detectedMedia == 'camera-mic') && <div><span className={css.alignText}><img src={microphone} width={25} height={25} /></span>Use your microphone</div>}
                        {(detectedMedia === 'geolocation' || detectedMedia == 'camera-mic-geolocation') && <div><span className={css.alignText}><img src={geolocation} width={25} height={25} /></span>Know your location</div>}

                        <div className={css.buttonGrp}>
                            <Button size="small" className={css.button} onClick={() => this.handlePermissions(1)}>{$L("Allow")}</Button>
                            <Button size="small" className={css.button} onClick={() => this.handlePermissions(2)}>{$L("Block")}</Button>
                        </div>
                    </div>
                </>
            );
        }
    }
}

const mapStateToProps = ({ popupState }) => ({
    allow_media_popup: popupState.allow_media_popup
});

const mapDispatchToProps = (dispatch) => ({
    set_allow_media_popup: (data) => dispatch(set_allow_media_popup(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Popup);
