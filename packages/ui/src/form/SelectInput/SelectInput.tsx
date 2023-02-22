import classNames from 'classnames';
import React, { forwardRef, Ref } from 'react';

import { Select, SelectProps } from '../Select';

export interface SelectInputProps extends SelectProps {
    additionalClassName?: string;
    appearFocused?: boolean;
}

const SelectInput = forwardRef(
    (
        { additionalClassName, appearFocused, ...rest }: SelectInputProps,
        ref: Ref<HTMLSelectElement>,
    ) => (
        <Select
            {...rest}
            className={classNames(
                'form-select',
                'optimizedCheckout-form-select',
                { 'form-select--focus': appearFocused },
                { 'optimizedCheckout-form-select--focus': appearFocused },
                additionalClassName,
            )}
            ref={ref}
        />
    ),
);

export default SelectInput;
