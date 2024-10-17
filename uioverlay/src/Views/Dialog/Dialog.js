import { useCallback, useState, useEffect } from 'react';

import {Dialog as DialogBase} from '../../../../samples/enact-based/src/components/Dialog/Dialog';

function Dialog({model}) {
    const [messageType, setMessageType] = useState('');
    const [messageText, setMessageText] = useState('');
    const [defaultPromptText, setDefaultPromptText] = useState('');
    const [alertsCount, setAlertsCount] = useState(0);

    const onDialogOk = useCallback((text) => {
        console.log(`button pressed ${alertsCount}`);
        model.ipc.post('button_pressed', {
            button: 'ok',
            text: text
        });
    }, [model.ipc, alertsCount]);

    const onAuthOk = useCallback((login, password) => {
        model.ipc.post('button_pressed', {
            button: 'ok',
            login: login,
            password: password
        });
    }, [model.ipc]);

    const onCancel = useCallback(() => {
        model.ipc.post('button_pressed', {button: 'cancel'});
    }, [model.ipc]);

    const blockDialogs = useCallback(() => {
        model.ipc.post('block_dialogs', {});
    }, [model.ipc]);

    useEffect(() => { setAlertsCount(model.alertsCount) }, [model.alertsCount]);
    useEffect(() => {
        const updateDialogProps = (e) => {
            const dialogProps = e.detail;
            setMessageType(dialogProps.messageType);
            setMessageText(dialogProps.messageText);
            setDefaultPromptText(dialogProps.defaultPromptText);
            setAlertsCount(dialogProps.alertsCount);
        };
        document.addEventListener('updateDialogPropsEvent', updateDialogProps, {once: true});
        return () => {
            document.removeEventListener('updateDialogPropsEvent', updateDialogProps);
        };
    }, []);

    const dialog = {
        defaultPromptText,
        isAlertsAllowed: true,
        alertsCount: alertsCount,
        alertsCountBeforePreventionRequest: 3,
        messageType: messageType,
        messageText: messageText,
        ok: messageType === 'auth' ? onAuthOk : onDialogOk,
        cancel: onCancel,
        blockDialogs: blockDialogs
    }

    return messageType ? <DialogBase dialog={dialog} /> : null;
}

export default Dialog;
