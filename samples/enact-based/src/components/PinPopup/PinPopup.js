/**
 * Contains the declaration for the PinPopup component.
 *
 */

import Button from '@enact/moonstone/Button';
import Dialog from '@enact/moonstone/Dialog';
import Input from '@enact/moonstone/Input';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import css from './PinPopup.less';

class PinPopup extends Component {
	static propTypes = {
		matched: PropTypes.any,
		onClose: PropTypes.func,
		onSubmit: PropTypes.func,
		open: PropTypes.bool
	}

	static defaultPropTypes = {
		open: false
	}

	constructor (props) {
		super(props);

		this.state = {
			pinValue: ''
		}
	}

	componentWillReceiveProps (nextProps) {
		if ((this.props.matched !== nextProps.matched) && (nextProps.matched === 'correct')) {
			this.onClose();
		}
	}

	onChange = (ev) => {
		if (ev.value.length < 5) {
			this.setState({pinValue: ev.value});
		}
	}

	onNumberKeyPressed = (ev) => {
		const key = ev.target.textContent;

		if (key === "BACK") {
			this.setState({pinValue: this.state.pinValue.slice(0, -1)});
		} else {
			if (this.state.pinValue.length < 4) {
				this.setState({pinValue: this.state.pinValue + key});
			}
		}
	}

	onSubmitPinCode = (ev) => {
		ev.preventDefault();
		this.props.onSubmit(this.state.pinValue);
	}

	onClose = () => {
		this.setState({pinValue: ''});
		this.props.onClose();
	}

	render () {
		const
			{open, matched} = this.props,
			disabledButtons = this.state.pinValue.length === 4;

		return (
			<Dialog
				open={open}
				showCloseButton
				onClose={this.onClose}
				title={matched === 'incorrect' ? "Check Password" : "Enter PIN"}
				titleBelow={
					matched === 'incorrect' ?
					"Incorrect password. Please enter correct password." :
					"Please enter the parental control PIN."
				}
			>
				<form className={css.form} onSubmit={this.onSubmitPinCode}>
					<Input
						className={css.input}
						dismissOnEnter
						onChange={this.onChange}
						type="number"
						value={this.state.pinValue}
					/>
				</form>
				<Button className={css.ok} onClick={this.onSubmitPinCode}>OK</Button>
				<div className={css.guide}>
					Use the pointer or number keys in your remote.
					<br />
					Press the back key to erase the number.
				</div>
				<br />
				<br />
				<Button disabled={disabledButtons} onClick={this.onNumberKeyPressed} small>0</Button>
				<Button disabled={disabledButtons} onClick={this.onNumberKeyPressed} small>1</Button>
				<Button disabled={disabledButtons} onClick={this.onNumberKeyPressed} small>2</Button>
				<Button disabled={disabledButtons} onClick={this.onNumberKeyPressed} small>3</Button>
				<Button disabled={disabledButtons} onClick={this.onNumberKeyPressed} small>4</Button>
				<Button disabled={disabledButtons} onClick={this.onNumberKeyPressed} small>5</Button>
				<Button disabled={disabledButtons} onClick={this.onNumberKeyPressed} small>6</Button>
				<Button disabled={disabledButtons} onClick={this.onNumberKeyPressed} small>7</Button>
				<Button disabled={disabledButtons} onClick={this.onNumberKeyPressed} small>8</Button>
				<Button disabled={disabledButtons} onClick={this.onNumberKeyPressed} small>9</Button>
				<Button onClick={this.onNumberKeyPressed} small>Back</Button>
			</Dialog>
		);
	}
}

export default PinPopup;
