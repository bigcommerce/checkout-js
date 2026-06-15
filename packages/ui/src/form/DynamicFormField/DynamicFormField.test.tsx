import { createLanguageService, type FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import React, { forwardRef, useImperativeHandle } from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { fireEvent, render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import { FormProvider } from '../contexts';

import DynamicFormField from './DynamicFormField';

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

describe('DynamicFormField Component', () => {
    const localeContext: LocaleContextType = { language: createLanguageService() };
    const formFields: FormFieldType[] = [
        {
            custom: false,
            default: 'NO PO BOX',
            id: 'field_18',
            label: 'Address Line 1',
            name: 'address1',
            required: true,
        },
        {
            custom: false,
            default: '',
            id: 'field_19',
            label: 'Address Line 2',
            name: 'address2',
            required: false,
        },
        {
            custom: true,
            default: '',
            fieldType: 'dropdown',
            id: 'field_27',
            label: 'Custom dropdown',
            name: 'field_27',
            options: {
                items: [
                    {
                        value: '0',
                        label: 'Foo',
                    },
                    {
                        value: '1',
                        label: 'Bar',
                    },
                ],
            },
            required: false,
            type: 'array',
        },
    ];
    const onChange = jest.fn();

    it('renders legacy class name', () => {
        const { container } = render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        extraClass="dynamic-form-field--addressLine1"
                        field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('.dynamic-form-field--addressLine1')).toBeInTheDocument();
    });

    it('renders FormField with expected props', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                        onChange={onChange}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('Address Line 1')).toBeInTheDocument();
        expect(screen.getByText('Address Line 1')).toHaveAttribute('for', 'address1');
    });

    it('renders label', () => {
        const { container } = render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                        label={<TranslatedString id="address.address_line_1_label" />}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(
            screen.getByText(localeContext.language.translate('address.address_line_1_label')),
        ).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('.optimizedCheckout-contentSecondary')).toBeNull();
    });

    it('renders `optional` label when field is not required', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        field={formFields.find(({ name }) => name === 'address2') as FormFieldType}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(
            screen.getByText(localeContext.language.translate('common.optional_text')),
        ).toBeInTheDocument();
    });

    describe('phone validation with isNewPhoneValidationExperimentEnabled', () => {
        // Phone field: fieldType 'text' + name containing 'phone' resolves to TELEPHONE internally
        const phoneFieldMock: FormFieldType = {
            custom: false,
            default: '',
            fieldType: 'text',
            id: 'field_phone',
            label: 'Phone Number',
            name: 'phone',
            required: false,
        };

        const nonPhoneFieldMock: FormFieldType = {
            custom: false,
            default: '',
            fieldType: 'text',
            id: 'field_firstname',
            label: 'First Name',
            name: 'firstName',
            required: false,
        };

        const localeContextMock: LocaleContextType = {
            language: createLanguageService(),
            date: { inputFormat: 'dd/MM/yyyy' },
        };

        const renderMockFormField = (overrides: {
            field: FormFieldType;
            isNewPhoneValidationExperimentEnabled: boolean;
        }) =>
            render(
                <LocaleContext.Provider value={localeContextMock}>
                    <Formik initialValues={{ phone: '' }} onSubmit={jest.fn()}>
                        {({ submitForm }) => (
                            <FormProvider initialIsSubmitted>
                                <DynamicFormField
                                    field={overrides.field}
                                    isNewPhoneValidationExperimentEnabled={
                                        overrides.isNewPhoneValidationExperimentEnabled
                                    }
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

        it('shows a validation error when the phone number is invalid and the experiment is enabled', async () => {
            mockIsValidNumber.mockReturnValue(false);

            renderMockFormField({
                field: phoneFieldMock,
                isNewPhoneValidationExperimentEnabled: true,
            });

            fireEvent.change(screen.getByTestId('phone-text'), {
                target: { value: '123' },
            });
            await userEvent.click(screen.getByText('Submit'));

            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });
        });

        it('does not show a validation error when the phone number is valid', async () => {
            mockIsValidNumber.mockReturnValue(true);

            renderMockFormField({
                field: phoneFieldMock,
                isNewPhoneValidationExperimentEnabled: true,
            });

            fireEvent.change(screen.getByTestId('phone-text'), {
                target: { value: '+15551234567' },
            });
            await userEvent.click(screen.getByText('Submit'));

            await waitFor(() => {
                expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            });
        });

        it('does not show a validation error when the phone field is empty', async () => {
            // there is a required check already, so no need to check validity in addition
            mockIsValidNumber.mockReturnValue(false);

            renderMockFormField({
                field: phoneFieldMock,
                isNewPhoneValidationExperimentEnabled: true,
            });

            // Leave value empty, submit directly
            await userEvent.click(screen.getByText('Submit'));

            await waitFor(() => {
                expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            });
        });

        it('does not validate phone when the experiment flag is disabled', async () => {
            mockIsValidNumber.mockReturnValue(false);

            renderMockFormField({
                field: phoneFieldMock,
                isNewPhoneValidationExperimentEnabled: false,
            });

            // Experiment off: IntlTelInput is not rendered, regular tel input is used instead
            fireEvent.change(screen.getByRole('textbox'), { target: { value: '123' } });
            await userEvent.click(screen.getByText('Submit'));

            await waitFor(() => {
                expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            });
        });

        it('does not validate phone for non-telephone fields even when experiment is enabled', async () => {
            mockIsValidNumber.mockReturnValue(false);

            renderMockFormField({
                field: nonPhoneFieldMock,
                isNewPhoneValidationExperimentEnabled: true,
            });

            fireEvent.change(screen.getByRole('textbox'), { target: { value: 'John' } });
            await userEvent.click(screen.getByText('Submit'));

            await waitFor(() => {
                expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            });
        });
    });
});
