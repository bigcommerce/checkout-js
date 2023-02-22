import React, { forwardRef, Ref, SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options: Array<{
        item: string;
        value: string;
    }>;
    testId?: string;
}

const Input = forwardRef(
    ({ options, testId, ...rest }: SelectProps, ref: Ref<HTMLSelectElement>) => (
        <select {...rest} data-test={testId} ref={ref}>
            {options.map(({ item, value }, index) => (
                <option key={index} value={value}>
                    {item}
                </option>
            ))}
        </select>
    ),
);

export default Input;
