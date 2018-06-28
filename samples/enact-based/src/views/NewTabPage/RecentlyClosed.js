/**
 * Contains the declaration for the RecentlyClosed component.
 *
 */

import Button from '@enact/moonstone/Button';
import React, {Component} from 'react';

import css from './RecentlyClosed.less';

class RecentlyClosed extends Component {
	constructor (props) {
		super(props);
		this.state = {
			showing: false
		}
	}

	onClick = () => {
		if (!this.state.showing) {
			this.props.onClick();
		}
		this.setState({showing: !this.state.showing});
	}

	render () {
		return (
			<div className={css.recentlyClosed}>
				<Button css={css} onClick={this.onClick} small>{'Recently Closed >'}</Button>
				{this.state.showing ? this.props.children : null}
			</div>
		);
	}
}

export default RecentlyClosed;
