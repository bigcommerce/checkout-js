import { createLanguageService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import React from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import { FormProvider } from '../contexts';

import { PhoneFormField, type PhoneFormFieldProps } from './PhoneFormField';

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

    it('renders IntlTelInput', () => {
        renderPhoneFormField();

        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('auto-sets country when selectedCountry is provided and the field value is empty', async () => {
        renderPhoneFormField({ selectedCountry: 'US' });

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /currently selected United States/ }),
            ).toBeInTheDocument();
        });
    });

    it('does not auto-set country when selectedCountry is not provided', () => {
        renderPhoneFormField();

        expect(
            screen.getByRole('button', { name: 'Select country for phone number' }),
        ).toBeInTheDocument();
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

        expect(
            screen.getByRole('button', { name: 'Select country for phone number' }),
        ).toBeInTheDocument();
    });

    it('shows a validation error when the phone number is invalid', async () => {
        renderPhoneFormField();

        await userEvent.type(screen.getByRole('textbox'), '123');
        await userEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });

    it('does not show a validation error when the phone number is valid', async () => {
        renderPhoneFormField();

        await userEvent.type(screen.getByRole('textbox'), '+447700900123');
        await userEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    it('does not show a validation error when the phone field is empty', async () => {
        renderPhoneFormField();

        await userEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});
