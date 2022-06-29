import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import { isNumber, noop } from 'lodash';
import React, { Fragment, PureComponent, ReactChild, ReactNode } from 'react';

import { Popover, PopoverList, PopoverListItem } from '../popover';

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

class Autocomplete extends PureComponent<AutocompleteProps> {
    render(): ReactNode {
        const {
            inputProps,
            initialValue,
            initialHighlightedIndex,
            items,
            children,
            onSelect,
            listTestId,
        } = this.props;

        return (
            <Downshift
                defaultHighlightedIndex={ 0 }
                initialHighlightedIndex={ initialHighlightedIndex }
                initialInputValue={ initialValue }
                itemToString={ this.itemToString }
                labelId={ inputProps && inputProps['aria-labelledby'] ? inputProps['aria-labelledby'] : null }
                onChange={ onSelect }
                onStateChange={ this.handleStateChange }
                stateReducer={ this.stateReducer }
            >
                { ({
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
                                    getItemProps={ getItemProps }
                                    highlightedIndex={ isNumber(highlightedIndex) ? highlightedIndex : -1 }
                                    items={ items.map(item => this.toPopoverItem(item)) }
                                    menuProps={ getMenuProps() }
                                    testId={ listTestId }
                                />
                                { children }
                            </Popover> }
                    </div>
                ) }
            </Downshift>
        );
    }

    private toPopoverItem(item: AutocompleteItem): PopoverListItem {
        return {
            ...item,
            content: this.highlightItem(item),
        };
    }

    private highlightItem(item: AutocompleteItem): ReactChild[] | ReactChild {
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

            node.push(<strong key={ key }>{ label.substr(offset, length) }</strong>);
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

    private itemToString(item?: AutocompleteItem): string {
        return item && item.value || '';
    }

    private stateReducer: (
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

    private handleStateChange = ({ isOpen, inputValue }: StateChangeOptions<string>) => {
        const { onToggleOpen = noop } = this.props;

        if (isOpen !== undefined) {
            onToggleOpen({ isOpen, inputValue: inputValue || '' });
        }
    };
}

export default Autocomplete;
