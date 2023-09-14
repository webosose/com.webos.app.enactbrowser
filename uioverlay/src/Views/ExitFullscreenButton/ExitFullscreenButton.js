import { useCallback, useEffect } from 'react';
import Button from '@enact/agate/Button';
import $L from '@enact/i18n/$L';

import css from './ExitFullscreenButton.module.less';

function ExitFullscreenButton(props) {
    const escKeyHandler = useCallback(({key}) => {
        if (key === 'Escape') {
            props.model.onClick()();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.model, props.model.onClick]);

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
                size={"large"}
            >
                {$L('Exit Full Screen')}
            </Button>
        </div>
    );
}

export default ExitFullscreenButton;
