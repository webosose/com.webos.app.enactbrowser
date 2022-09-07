import React from 'react';
import Button from '@enact/moonstone/Button';
import $L from '@enact/i18n/$L';

import css from './ExitFullscreenButton.less';

function ExitFullscreenButton(props) {
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
