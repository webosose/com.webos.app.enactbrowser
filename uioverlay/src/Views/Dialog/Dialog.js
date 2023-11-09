import { useCallback, useState, useEffect } from 'react';

import {Dialog as DialogBase} from '../../../../samples/enact-based/src/components/Dialog/Dialog';

function Dialog({model}) {
    const [messageType, setMessageType] = useState('');
    const [messageText, setMessageText] = useState('');
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
        setMessageType(model.dialogProps.messageType);
        setMessageText(model.dialogProps.messageText);
        setAlertsCount(model.dialogProps.alertsCount);
    }, [model.dialogProps]);

    const dialog = {
        defaultPromptText: "",
        isAlertsAllowed: true,
        alertsCount: alertsCount,
        alertsCountBeforePreventionRequest: 3,
        messageType: messageType,
        messageText: messageText,
        ok: messageType === 'auth' ? onAuthOk : onDialogOk,
        cancel: onCancel,
        blockDialogs: blockDialogs
    }

    return (
            <DialogBase
                dialog={dialog}
            />
    );
}

export default Dialog;
