/**
 * Contains the declaration for the Sortable HOC.
 *
 */

import hoc from '@enact/core/hoc';
import React, {Component} from 'react';
import PropTypes from 'prop-types';

const
	nop = () => {},
	defaultConfig = {
		onDragStart: nop,
		onDragEnter: nop,
		onDragEnd: nop
	};

const DraggableHoC = hoc(defaultConfig, (config, Wrapped) => {
	const {onDragStart, onDragEnter, onDragEnd} = config;

	return class Draggable extends Component {
		static displayName = 'Draggable'

		render () {
			return (
				<Wrapped
					onDragEnd={onDragEnd}
					onDragStart={onDragStart}
					onDragEnter={onDragEnter}
					draggable
					{...this.props}
				/>
			);
		}
	}
});

const insertAfter = (newElem, reference) => {
	const parent = reference.parentNode;
	const next = reference.nextSibling;
	if (next) {
		return parent.insertBefore(newElem, next);
	} else {
		return parent.appendChild(newElem);
	}
}

const SortableHoC = hoc((config, Wrapped) => {
	const {component, placeholder} = config;

	return class Sortable extends Component {
		static displayName = 'Sortable'

		static propTypes = {
			onMove: PropTypes.func,
			dropPlaceholder: PropTypes.any
		}

		onDragStart = (e) => {
			this.dragged = e.currentTarget;
			e.dataTransfer.effectAllowed = 'move';

			e.dataTransfer.setData('text/html', e.currentTarget);
		}

		onDragEnd = () => {
			if (this.dragged && this.over) {
				// extract from to
				const fromIndex = Number(this.dragged.dataset.id);
				let toIndex = Number(this.over.dataset.id);

				// Adjust final toIndex based on fromIndex
				if (fromIndex < toIndex && this.over.previousSibling === placeholder) {
					toIndex--;
				}
				else if (fromIndex > toIndex && this.over.nextSibling === placeholder) {
					toIndex++;
				}

				this.dragged.style.display = 'flex';
				this.dragged.parentNode.removeChild(placeholder);

				// send it to browser so that it can re render tabs
				if (this.childRef.onMove) {
					this.childRef.onMove(fromIndex, toIndex);
				}
			}
		}

		onDragOver = (e) => {
			e.preventDefault();
		}

		onDragEnter = (e) => {
			const parent = e.currentTarget.parentNode;
			this.dragged.style.display = 'none';
			this.over = e.currentTarget;

			console.log('onDragEnter ' + this.dragged.dataset.id);
			console.log('onDragEnter ' + this.over.dataset.id);

			if (placeholder.previousSibling === this.over) {
				parent.insertBefore(placeholder, this.over);
			} else {
				insertAfter(placeholder, this.over);
			}
		}

		initRef = (ref) => {
			this.childRef = ref;
		}

		render () {
			const props = Object.assign({}, this.props);
			const DraggableComponent = DraggableHoC({
				onDragStart: this.onDragStart,
				onDragEnter: this.onDragEnter,
				onDragEnd: this.onDragEnd
			}, component);

			return (
				<Wrapped
					ref={this.initRef}
					component={DraggableComponent}
					onDragOver={this.onDragOver}
					{...props}
				/>
			);
		}

	}
});

export default SortableHoC;
export {SortableHoC as Sortable};
