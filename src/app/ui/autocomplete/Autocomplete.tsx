import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import { isNumber, noop } from 'lodash';
import React, { Component, Fragment, ReactChild, ReactNode } from 'react';

import Popover from '../popover/Popover';
import PopoverList, { PopoverListItem } from '../popover/PopoverList';

import AutocompleteItem from './autocomplete-item';

export interface AutocompleteProps {
    initialValue?: string;
    initialHighlightedIndex?: number;
    children?: ReactNode;
    items: AutocompleteItem[];
    inputProps?: any;
    listTestId?: string;
    onToggleOpen?(state: { inputValue: string; isOpen: boolean }): void;
    onSelect?(item: AutocompleteItem): void;
    onChange?(value: string, isOpen: boolean): void;
}

class Autocomplete extends Component<AutocompleteProps> {
    render(): ReactNode {
        const {
            inputProps,
            initialValue,
            initialHighlightedIndex,
            items,
            children,
            onSelect,
            listTestId,
            onToggleOpen = noop,
        } = this.props;

        return (
            <Downshift
                initialInputValue={ initialValue }
                defaultHighlightedIndex={ 0 }
                initialHighlightedIndex={ initialHighlightedIndex }
                onStateChange={ ({ isOpen, inputValue }) => {
                    if (isOpen !== undefined) {
                        onToggleOpen({ isOpen, inputValue: inputValue || ''  });
                    }
                }}
                stateReducer={ (state, changes) => this._stateReducer(state, changes) }
                onChange={ onSelect }
                itemToString={ this._itemToString }
            >
                {({
                    isOpen,
                    getInputProps,
                    getMenuProps,
                    getItemProps,
                    highlightedIndex,
                }) => (
                    <div>
                        <input
                            { ...getInputProps() }
                            { ...inputProps }
                        />
                        { isOpen && !!items.length &&
                            <Popover>
                                <PopoverList
                                    testId={ listTestId }
                                    menuProps={ getMenuProps() }
                                    items={ items.map(item => this._toPopoverItem(item)) }
                                    highlightedIndex={ isNumber(highlightedIndex) ? highlightedIndex : -1 }
                                    getItemProps={ getItemProps }
                                />
                                { children }
                            </Popover>
                        }
                    </div>
                )}
            </Downshift>
        );
    }

    private _toPopoverItem(item: AutocompleteItem): PopoverListItem {
        return {
            ...item,
            content: this._highlightItem(item),
        };
    }

    private _highlightItem(item: AutocompleteItem): ReactChild[] | ReactChild {
        if (!item.highlightedSlices || !item.highlightedSlices.length) {
            return item.label;
        }

        let lastIndex: number = 0;
        let key = 0;

        return item.highlightedSlices.reduce((node, slice, i) => {
            const { label } = item;
            const { offset, length } = slice;
            const notHighlightedLength = offset - lastIndex;

            if (notHighlightedLength) {
                node.push(<Fragment key={ key }>
                    { label.substr(lastIndex, notHighlightedLength) }
                </Fragment>);
                key += 1;
            }

            lastIndex  = offset + length;

            node.push(<strong key={ key }>{label.substr(offset, length)}</strong>);
            key += 1;

            if (i === (item.highlightedSlices || []).length - 1) {
                node.push(<Fragment key={ key }>
                    { label.substr(lastIndex) }
                </Fragment>);
                key += 1;
            }

            return node;
        }, [] as ReactChild[]);
    }

    private _itemToString(item?: AutocompleteItem): string {
        return item && item.value || '';
    }

    private _stateReducer: (
        state: DownshiftState<AutocompleteItem>,
        changes: StateChangeOptions<AutocompleteItem>
    ) => Partial<StateChangeOptions<AutocompleteItem>> = (state, changes) => {
        const { onChange } = this.props;

        switch (changes.type) {
        case Downshift.stateChangeTypes.blurInput:
        case Downshift.stateChangeTypes.blurButton:
        case Downshift.stateChangeTypes.mouseUp:
        case Downshift.stateChangeTypes.touchEnd:
            return {
                ...changes,
                inputValue: state.inputValue,
            };

        case Downshift.stateChangeTypes.changeInput:
            if (changes.inputValue !== state.inputValue && onChange) {
                onChange(changes.inputValue || '', state.isOpen);
            }

            return changes;

        case Downshift.stateChangeTypes.keyDownEnter:
            return changes;

        default:
            return changes;
        }
    };
}

export default Autocomplete;
