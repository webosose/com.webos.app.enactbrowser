import {ButtonBase} from '@enact/moonstone/Button';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import componentCss from './BrowserButtonBase.less';

const BrowserButtonBase = kind({
	name: 'BrowserButtonBase',

	propTypes: {
		withBg: PropTypes.bool
	},

	defaultProps: {
		withBg: false
	},

	styles: {
		css: componentCss,
		className: 'browserButtonBase'
	},

	computed: {
		className: ({withBg, styler}) => styler.append({withBg})
	},

	render: ({css, ...rest}) => {
		delete rest.withBg;

		return (
			<ButtonBase
				css={css}
				{...rest}
			/>
		);
	}
});

export default BrowserButtonBase;
export {
	BrowserButtonBase
};
