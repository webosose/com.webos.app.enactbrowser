import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import componentCss from './BrowserIcon.less';

const BrowserIcon = kind({
	name: 'BrowserIcon',

	propTypes: {
		css: PropTypes.object,
		pressed: PropTypes.bool,
		small: PropTypes.bool
	},

	defaultProps: {
		pressed: false,
		small: false
	},

	styles: {
		css: componentCss,
		className: 'browserIcon',
		publicClassNames: true
	},

	computed: {
		className: ({pressed, small, styler}) => styler.append({
			pressed,
			small
		})
	},

	render: (props) => {
		delete props.pressed;
		delete props.small;

		return (
			<div
				aria-hidden
				{...props}
			/>
		);
	}
});

export default BrowserIcon;
export {
	BrowserIcon
};
