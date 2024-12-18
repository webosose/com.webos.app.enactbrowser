import {useRef, useEffect, useReducer} from 'react';
import Scroller from '@enact/agate/Scroller';
import classNames from 'classnames';

import css from './OverlapVKB.module.less';

const OverlapVKB = ({children, alwaysShowBookmarks, ...rest}) => {
        const bodyRef = useRef(null);
        const [, forceUpdate] = useReducer(x => x + 1, 0);
        let scrollTopFn, originalTop;

        useEffect(() => {
            window.shell.shellWindow.on('vkb-overlap', onOverlabVKB);
            window.shell.shellWindow.on('vkb-change-state', removeVkbInset)

            return () => {
                window.shell.shellWindow.removeEventListener('vkb-overlap', onOverlabVKB);
                window.shell.shellWindow.removeEventListener('vkb-change-state', removeVkbInset);
            }
        }, []);

        const cbScrollTo = (fn) => scrollTopFn = fn;

        const onScrollStart  = ({scrollTop}) => originalTop = scrollTop;

        const onOverlabVKB = ({height}) => {
            if (bodyRef && bodyRef.current.parentNode.clientHeight > bodyRef.current.clientHeight) {
                document.body.querySelector('.vkb_inset').style.height = `${height}px`;
                forceUpdate();
            }
            const input = document.activeElement;
            scrollTopFn({node: input, animate: false});
        };

        const removeVkbInset = (isShow) => {
            if (!isShow) {
                document.body.querySelector('.vkb_inset').style.height = 0;
                scrollTopFn({position: {y: originalTop}, animate: false});
            }
        }

        const scrollerClass = classNames(css.scroller, {[css.shrinkHeight]: alwaysShowBookmarks});

        return (
            <Scroller
                {...rest}
                cbScrollTo={cbScrollTo}
                onScrollStart={onScrollStart}
                className={scrollerClass}
            >
                <div ref={bodyRef}>
                    {children}
                    <div className="vkb_inset" />
                </div>
            </Scroller>
        );
};

export default OverlapVKB;
export {OverlapVKB}
