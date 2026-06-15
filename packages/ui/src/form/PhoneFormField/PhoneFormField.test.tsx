import { createLanguageService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import React, { forwardRef, useImperativeHandle } from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { fireEvent, render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import { FormProvider } from '../contexts';

import { PhoneFormField, type PhoneFormFieldProps } from './PhoneFormField';

const mockIsValidNumber = jest.fn();
const mockSetCountry = jest.fn();

jest.mock('@intl-tel-input/react', () => ({
    __esModule: true,
    default: forwardRef<
        unknown,
        {
            inputProps?: Record<string, unknown>;
            onChangeNumber?: (value: string) => void;
            value?: string;
        }
    >(({ inputProps, onChangeNumber, value }, ref) => {
        useImperativeHandle(ref, () => ({
            getInstance: () => ({
                isValidNumber: mockIsValidNumber,
                setCountry: mockSetCountry,
            }),
        }));

        return (
            <input
                {...inputProps}
                onChange={(e) => onChangeNumber?.(e.target.value)}
                value={value ?? ''}
            />
        );
    }),
}));

describe('PhoneFormField', () => {
    const localeContextMock: LocaleContextType = {
        language: createLanguageService(),
        date: { inputFormat: 'dd/MM/yyyy' },
    };

    const renderPhoneFormField = (props?: Partial<PhoneFormFieldProps>) =>
        render(
            <LocaleContext.Provider value={localeContextMock}>
                <Formik initialValues={{ phone: '' }} onSubmit={jest.fn()}>
                    {({ submitForm }) => (
                        <FormProvider initialIsSubmitted>
                            <PhoneFormField
                                id="phone"
                                label="Phone Number"
                                name="phone"
                                {...props}
                            />
                            <button onClick={submitForm} type="button">
                                Submit
                            </button>
                        </FormProvider>
                    )}
                </Formik>
            </LocaleContext.Provider>,
        );

    beforeEach(() => {
        mockIsValidNumber.mockClear();
        mockSetCountry.mockClear();
    });

    it('renders IntlTelInput', () => {
        renderPhoneFormField();

        expect(screen.getByTestId('phone-text')).toBeInTheDocument();
    });

    it('auto-sets country when selectedCountry is provided and the field value is empty', () => {
        renderPhoneFormField({ selectedCountry: 'US' });

        expect(mockSetCountry).toHaveBeenCalledWith('us');
    });

    it('does not auto-set country when selectedCountry is not provided', () => {
        renderPhoneFormField();

        expect(mockSetCountry).not.toHaveBeenCalled();
    });

    it('does not auto-set country when a value is already present', () => {
        render(
            <LocaleContext.Provider value={localeContextMock}>
                <Formik initialValues={{ phone: '+15551234567' }} onSubmit={jest.fn()}>
                    <FormProvider initialIsSubmitted>
                        <PhoneFormField
                            id="phone"
                            label="Phone Number"
                            name="phone"
                            selectedCountry="US"
                        />
                    </FormProvider>
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(mockSetCountry).not.toHaveBeenCalled();
    });

    it('shows a validation error when the phone number is invalid', async () => {
        mockIsValidNumber.mockReturnValue(false);

        renderPhoneFormField();

        fireEvent.change(screen.getByTestId('phone-text'), { target: { value: '123' } });
        await userEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });

    it('does not show a validation error when the phone number is valid', async () => {
        mockIsValidNumber.mockReturnValue(true);

        renderPhoneFormField();

        fireEvent.change(screen.getByTestId('phone-text'), {
            target: { value: '+15551234567' },
        });
        await userEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    it('does not show a validation error when the phone field is empty', async () => {
        mockIsValidNumber.mockReturnValue(false);

        renderPhoneFormField();

        await userEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});
