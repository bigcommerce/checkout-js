import Downshift, { type DownshiftState, type StateChangeOptions } from 'downshift';
import { noop } from 'lodash';
import React, { type ReactNode, useCallback } from 'react';

import type AutocompleteItem from './autocomplete-item';
import AutocompleteContent from './AutocompleteContent';
import { itemToString } from './utils';

export interface InputPropsType {
    className: string;
    id: string;
    'aria-labelledby': string;
    placeholder: string | undefined;
    labelText: React.JSX.Element | null;
    maxLength: number | undefined;
}

export interface AutocompleteProps {
    initialValue?: string;
    initialHighlightedIndex?: number;
    defaultHighlightedIndex?: number;
    children?: ReactNode;
    items: AutocompleteItem[];
    inputProps?: InputPropsType;
    listTestId?: string;
    onToggleOpen?(state: { inputValue: string; isOpen: boolean }): void;
    onSelect?(item: AutocompleteItem | null): void;
    onChange?(value: string, isOpen: boolean): void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
    inputProps,
    initialValue,
    initialHighlightedIndex,
    defaultHighlightedIndex,
    items,
    children,
    onSelect,
    listTestId,
    onChange,
    onToggleOpen = noop,
}) => {
    const stateReducer = useCallback(
        (
            state: DownshiftState<AutocompleteItem>,
            changes: StateChangeOptions<AutocompleteItem>,
        ): Partial<StateChangeOptions<AutocompleteItem>> => {
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
        },
        [onChange],
    );

    const handleStateChange = useCallback(
        ({ isOpen, inputValue }: StateChangeOptions<AutocompleteItem>) => {
            if (isOpen !== undefined) {
                onToggleOpen({ isOpen, inputValue: inputValue || '' });
            }
        },
        [onToggleOpen],
    );

    return (
        <Downshift
            defaultHighlightedIndex={defaultHighlightedIndex}
            initialHighlightedIndex={initialHighlightedIndex}
            initialInputValue={initialValue}
            itemToString={itemToString}
            labelId={inputProps && inputProps['aria-labelledby']}
            onChange={onSelect}
            onStateChange={handleStateChange}
            stateReducer={stateReducer}
        >
            {({ isOpen, getInputProps, getMenuProps, getItemProps, highlightedIndex }) => {
                return (
                    <div>
                        <AutocompleteContent
                            getInputProps={getInputProps}
                            getItemProps={getItemProps}
                            getMenuProps={getMenuProps}
                            highlightedIndex={highlightedIndex}
                            initialValue={initialValue}
                            inputProps={inputProps}
                            isOpen={isOpen}
                            items={items}
                            listTestId={listTestId}
                        >
                            {children}
                        </AutocompleteContent>
                    </div>
                );
            }}
        </Downshift>
    );
};

export default Autocomplete;
