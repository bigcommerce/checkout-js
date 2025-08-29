import { includes, isNumber } from 'lodash';
import React, { type ReactNode } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/ui';

import { Label } from '../form';
import { Popover, PopoverList } from '../popover';

import type AutocompleteItem from './autocomplete-item';
import { toPopoverItem } from './utils';

export interface AutocompleteContentProps {
    isOpen: boolean;
    getInputProps: (options?: any) => any;
    getMenuProps: () => any;
    getItemProps: (options: any) => any;
    highlightedIndex: number | null;
    initialValue?: string;
    inputProps?: any;
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
    const validInputProps = { ...getInputProps({ value: initialValue }), ...inputProps };

    delete validInputProps.labelText;

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
                        getItemProps={getItemProps}
                        highlightedIndex={
                            isNumber(highlightedIndex) ? highlightedIndex : -1
                        }
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
