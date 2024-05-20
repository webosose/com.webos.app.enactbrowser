import { useCallback, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import $L from '@enact/i18n/$L';
import { isWindowReady } from '@enact/core/snapshot';
import TooltipDecorator from "@enact/agate/TooltipDecorator";
import Button from "@enact/agate/Button";
import css from './PWAButton.module.less';

const TooltipButton = TooltipDecorator(
    { tooltipDestinationProp: "decoration" },
    Button
);

const PWAButtonBase = function ({ tabType, tabIsLoading, strViewId, webViews }) {
    const [pShow, setShow] = useState(false);
    const webview = webViews[Number(strViewId)];

    console.log(`[PWAButton] update. `, tabType, tabIsLoading, strViewId, webview, `show: ${pShow}`);

    const onClick = useCallback(() => {
        if (isWindowReady()) {
            webview.installApp().then(({ pSuccess }) => {
                setShow(!pSuccess);
                console.log(`PWA application install status: ${pSuccess}`);
            })
                .catch((e) => {
                    console.error(`error while install PWA: `, e);
                });
        }
    }, [webview]);

    useEffect(() => {
        if (isWindowReady() && tabType === "webview" && tabIsLoading === false && webview) {
            webview.getInfo().then(({ installable, installed }) => {
                setShow( // show 'install' button if ...
                    !!installable // can be installed as PWA
                    && !installed // not installed yet
                );
            })
                .catch((e) => {
                    setShow(false);
                    console.error("[PWAButton] get info error: ", e);
                });
        } else {
            setShow(false);
        }
    }, [tabType, tabIsLoading, webview]);

    return (
        <div>
            {
                pShow ?
                    <TooltipButton
                        css={css}
                        backgroundOpacity="transparent"
                        onClick={onClick}
                        tooltipText={$L('Install PWA')}
                        icon="backapp"
                        size="large"
                    />
                    : null
            }
        </div>
    )
}

const mapStateToProps = ({ tabsState }) => {
    const strViewId = tabsState.ids[tabsState.selectedIndex];
    const tab = tabsState.tabs[strViewId];
    return tab ? {
        tabType: tab.type,
        tabIsLoading: tab.navState.isLoading,
        strViewId: strViewId
    } : {}
};

const PWAButton = connect(mapStateToProps, null)(PWAButtonBase);

export default PWAButton;
