import React, { useCallback, useEffect } from 'react';
import Button from '@enact/moonstone/Button';
import $L from '@enact/i18n/$L';

import css from './ExitFullscreenButton.less';

function ExitFullscreenButton(props) {
    const escKeyHandler = useCallback(({key}) => {
        if (key === 'Escape') {
            props.model.onClick()();
        }
    }, [props.model.onClick]);

    useEffect(() => {
        document.addEventListener('keydown', escKeyHandler);
        return () => {
            document.removeEventListener('keydown', escKeyHandler);
        }
    }, [props.model.onClick, escKeyHandler]);

    return (
        <div {...props} className={css.topArea}>
            <Button
                minWidth={false}
                className={css.exitButton}
                onClick={props.model.onClick()}
            >
                {$L('Exit Full Screen')}
            </Button>
        </div>
    );
}

export default ExitFullscreenButton;
