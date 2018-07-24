// Copyright (c) 2018 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

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
