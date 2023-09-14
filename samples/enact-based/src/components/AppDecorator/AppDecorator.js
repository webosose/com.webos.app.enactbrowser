import React from 'react';
import hoc from '@enact/core/hoc';

const defaultConfig = {
	accent: '#ff2d55',
	highlight: '#9e00d8',
	skin: 'silicon',
	skinVariants: 'night',
	sync: false,
	i18n: false,
};

const DummyDiv = () => (
	<div
		style={{
			position: 'absolute',
			left: '0',
			top: '0',
			right: '0',
			bottom: '0',
			background: 'black'
		}}
	/>
);

const AppDecorator = hoc(defaultConfig, (config, Wrapped) => {
	return class extends React.Component {
		static displayName = 'AppDecorator';
		constructor (props) {
			super(props);

			this.state = {
				skinVariants: 'night'
			};
		}

		render () {
			const {accent, highlight, skin} = config;

			return (
				(this.state.skinVariants === null) ?
					<DummyDiv /> :
					<Wrapped
						accent={accent}
						highlight={highlight}
						skin={skin}
						skinVariants={this.state.skinVariants}
						{...this.props}
					/>
			);
		};
	}
});

export default AppDecorator;
