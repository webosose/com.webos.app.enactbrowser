import {IconButtonBase as UiIconButtonBase} from '@enact/ui/IconButton';
import {IconButtonDecorator} from '@enact/moonstone/IconButton';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import {BrowserButtonBase as ButtonBase} from '../BrowserButtonBase';
import BrowserIcon from '../BrowserIcon';

import componentCss from './BrowserIconButton.less';

const BrowserIconButtonBase = kind({
	name: 'BrowserIconButton',

	propTypes: {
		/**
		 * The background-color opacity of this icon button
		 *
		 * Valid values are:
		 * * `'opaque'`,
		 * * `'translucent'`,
		 * * `'lightTranslucent'`, and
		 * * `'transparent'`.
		 *
		 * @type {String}
		 * @default 'opaque'
		 * @public
		 */
		backgroundOpacity: PropTypes.oneOf(['opaque', 'translucent', 'lightTranslucent', 'transparent']),

		/**
		 * The color of the underline beneath the icon.
		 *
		 * This property accepts one of the following color names, which correspond with the
		 * colored buttons on a standard remote control: `'red'`, `'green'`, `'yellow'`, `'blue'`
		 *
		 * @type {String}
		 * @public
		 */
		color: PropTypes.oneOf([null, 'red', 'green', 'yellow', 'blue']),

		/**
		 * An optional node to receive the tooltip from `TooltipDecorator`.
		 *
		 * @type {Node}
		 * @private
		 */
		tooltipNode: PropTypes.node,

		/**
		* Type for the icon buttons
		*
		* @type {String}
		* @public
		*/
		type: PropTypes.string
	},

	styles: {
		css: componentCss,
		publicClassNames: true
	},

	computed: {
		className: ({color, type, styler}) => styler.append(color, type)
	},

	render: ({css, tooltipNode, ...rest}) => {
		delete rest.type;

		return (
			<UiIconButtonBase
				{...rest}
				buttonComponent={ButtonBase}
				css={css}
				iconComponent={BrowserIcon}
			>
				{tooltipNode}
			</UiIconButtonBase>
		);
	}
});

const BrowserIconButton = IconButtonDecorator(BrowserIconButtonBase);

export default BrowserIconButton;
export {
	BrowserIconButton
};
