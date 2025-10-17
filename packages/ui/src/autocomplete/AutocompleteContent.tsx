import type { GetInputPropsOptions, GetItemPropsOptions, GetMenuPropsOptions } from 'downshift';
import { includes, isNumber } from 'lodash';
import React, { type ReactNode } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';

import { Label } from '../form';
import { Popover, PopoverList } from '../popover';

import { type InputPropsType } from './Autocomplete';
import type AutocompleteItem from './autocomplete-item';
import { toPopoverItem } from './utils';

export interface AutocompleteContentProps {
    isOpen: boolean;
    getInputProps: (options?: GetInputPropsOptions) => React.InputHTMLAttributes<HTMLInputElement>;
    getMenuProps: (options?: GetMenuPropsOptions) => React.HTMLAttributes<HTMLElement>;
    getItemProps: (
        options: GetItemPropsOptions<AutocompleteItem>,
    ) => React.HTMLAttributes<HTMLElement>;
    highlightedIndex: number | null;
    initialValue?: string;
    inputProps?: InputPropsType;
    items: AutocompleteItem[];
    listTestId?: string;
    children?: ReactNode;
}

const AutocompleteContent: React.FC<AutocompleteContentProps> = ({
    isOpen,
    getInputProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    initialValue,
    inputProps,
    items,
    listTestId,
    children,
}) => {
    const { themeV2 } = useThemeContext();
    const baseInputProps = getInputProps({ value: initialValue });
    const combinedProps = { ...baseInputProps, ...inputProps };

    // Extract labelText to avoid passing it to input element
    const { labelText: _labelText, ...validInputProps } = combinedProps;

    const getProps = (index: number, itemId: string) => {
        const autocompleteItem = items.find((item) => item.id === itemId);

        if (!autocompleteItem) {
            return {};
        }

        return getItemProps({
            key: itemId,
            index,
            item: autocompleteItem,
        });
    };

    return (
        <>
            <input {...validInputProps} />
            {inputProps && includes(inputProps.className, 'floating') && (
                <Label
                    additionalClassName={themeV2 ? 'floating-form-field-label' : ''}
                    htmlFor={inputProps.id}
                    id={inputProps['aria-labelledby']}
                    isFloatingLabelEnabled={true}
                >
                    {inputProps.labelText}
                </Label>
            )}
            {isOpen && !!items.length && (
                <Popover>
                    <PopoverList
                        getItemProps={getProps}
                        highlightedIndex={isNumber(highlightedIndex) ? highlightedIndex : -1}
                        items={items.map((item) => toPopoverItem(item))}
                        menuProps={getMenuProps()}
                        testId={listTestId}
                    />
                    {children}
                </Popover>
            )}
        </>
    );
};

export default AutocompleteContent;
