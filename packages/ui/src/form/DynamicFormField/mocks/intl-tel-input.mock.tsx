import React, { forwardRef, useImperativeHandle } from 'react';

const mockIsValidNumber = jest.fn();
const mockSetCountry = jest.fn();

interface IntlTelInputMockOverrides {
    isValidNumber?: jest.Mock;
    setCountry?: jest.Mock;
}

interface ItiPhoneInputProps {
    inputProps?: Record<string, unknown>;
    onChangeNumber?: (value: string) => void;
    value?: string;
}

export const getIntlTelInputPackageMock = (overrides: IntlTelInputMockOverrides = {}) => ({
    __esModule: true,
    default: forwardRef<unknown, ItiPhoneInputProps>(
        ({ inputProps, onChangeNumber, value }, ref) => {
            useImperativeHandle(ref, () => ({
                getInstance: () => ({
                    isValidNumber: overrides.isValidNumber ?? mockIsValidNumber,
                    setCountry: overrides.setCountry ?? mockSetCountry,
                }),
            }));

            return (
                <input
                    data-test="iti-phone-input"
                    {...inputProps}
                    onChange={(e) => onChangeNumber?.(e.target.value)}
                    value={value ?? ''}
                />
            );
        },
    ),
});
