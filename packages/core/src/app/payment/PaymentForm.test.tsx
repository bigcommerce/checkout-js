import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    type FormField,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import { ExtensionService } from '@bigcommerce/checkout/checkout-extension';
import {
    CheckoutProvider,
    defaultCapabilities,
    ExtensionProvider,
    type ExtensionServiceInterface,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';
import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import { getCart } from '../cart/carts.mock';
import { createErrorLogger } from '../common/error';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import { getPaymentMethod } from './payment-methods.mock';
import PaymentContext, { type PaymentContextProps } from './PaymentContext';
import PaymentForm, { type PaymentFormProps } from './PaymentForm';

jest.useFakeTimers({ legacyFakeTimers: true });

jest.mock('./ProvidersSectionOnTopOfPaymentsList', () => ({
    ProvidersSectionOnTopOfPaymentsList: jest.fn(() => (
        <div data-test="providers-section-on-top-of-payments-list" />
    )),
}));

describe('PaymentForm', () => {
    let checkoutService: CheckoutService;
    let extensionService: ExtensionServiceInterface;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentFormProps;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    let PaymentFormTest: FunctionComponent<PaymentFormProps>;

    beforeEach(() => {
        defaultProps = {
            isStoreCreditApplied: true,
            defaultMethodId: getPaymentMethod().id,
            isPaymentDataRequired: jest.fn(() => true),
            methods: [getPaymentMethod(), { ...getPaymentMethod(), id: 'cybersource' }],
            onSubmit: jest.fn(),
        };

        checkoutService = createCheckoutService();
        extensionService = new ExtensionService(checkoutService, createErrorLogger());
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        PaymentFormTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentContext.Provider value={paymentContext}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={null} onSubmit={noop}>
                            <ExtensionProvider extensionService={extensionService}>
                                <PaymentForm {...props} />
                            </ExtensionProvider>
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders list of payment methods', () => {
        render(<PaymentFormTest {...defaultProps} />);

        expect(screen.getAllByRole('list')).toHaveLength(3);
        expect(screen.getAllByRole('listitem')).toHaveLength(8);
        expect(screen.getAllByRole('group')).toHaveLength(2);
        expect(screen.getAllByRole('radio')).toHaveLength(2);
        expect(screen.getAllByText('Authorizenet')).toHaveLength(3); // 2 radio buttons + 1 title for a11y (hidden)
        expect(
            screen.getByText(localeContext.language.translate('payment.place_order_action')),
        ).toBeInTheDocument();
        expect(screen.getByTestId('providers-section-on-top-of-payments-list')).toBeInTheDocument();
    });

    it('renders terms and conditions field if copy is provided', () => {
        const textAcceptTerms = 'Accept terms';

        render(
            <PaymentFormTest
                {...defaultProps}
                isTermsConditionsRequired={true}
                termsConditionsText={textAcceptTerms}
            />,
        );

        expect(
            screen.getByText(
                localeContext.language.translate(
                    'terms_and_conditions.terms_and_conditions_heading',
                ),
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                localeContext.language.translate('terms_and_conditions.agreement_text'),
            ),
        ).toBeInTheDocument();
        expect(screen.getByText(textAcceptTerms)).toBeInTheDocument();
    });

    it('renders terms and conditions field if terms URL is provided', () => {
        const url = 'https://foobar.com/terms';

        render(
            <PaymentFormTest
                {...defaultProps}
                isTermsConditionsRequired={true}
                termsConditionsUrl={url}
            />,
        );

        expect(
            screen.getByText(
                localeContext.language.translate(
                    'terms_and_conditions.terms_and_conditions_heading',
                ),
            ),
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'terms and conditions' })).toHaveAttribute(
            'href',
            url,
        );
    });

    it('does not render terms and conditions field if it is not required', () => {
        render(<PaymentFormTest {...defaultProps} />);

        expect(
            screen.queryByText(
                localeContext.language.translate(
                    'terms_and_conditions.terms_and_conditions_heading',
                ),
            ),
        ).not.toBeInTheDocument();
    });

    it('renders spam protection field if spam check should be executed', () => {
        render(<PaymentFormTest {...defaultProps} shouldExecuteSpamCheck={true} />);

        expect(document.querySelector('.loadingOverlay-container')).toBeInTheDocument();
        expect(document.querySelector('.spamProtection-container')).toBeInTheDocument();
    });

    it('renders store credit field if store credit can be applied', () => {
        render(<PaymentFormTest {...defaultProps} usableStoreCredit={100} />);

        expect(
            screen.getByRole('checkbox', {
                name: 'Apply $112.00 store credit to order',
            }),
        ).toBeInTheDocument();
        expect(screen.getByText(/Apply/)).toBeInTheDocument();
        expect(screen.getByText('$112.00')).toBeInTheDocument();
        expect(screen.getByText(/store credit to order/)).toBeInTheDocument();
    });

    it('does not render store credit field if store credit cannot be applied', () => {
        render(<PaymentFormTest {...defaultProps} />);

        expect(screen.queryByText(/store credit/)).not.toBeInTheDocument();
    });

    it('does not render store credit field when disableStoreCredit is true even if store credit is available', () => {
        render(
            <PaymentFormTest {...defaultProps} disableStoreCredit={true} usableStoreCredit={100} />,
        );

        expect(screen.queryByRole('checkbox', { name: /store credit/ })).not.toBeInTheDocument();
        expect(screen.queryByText(/store credit/)).not.toBeInTheDocument();
    });

    it('renders store credit field when disableStoreCredit is false and store credit is available', () => {
        render(
            <PaymentFormTest
                {...defaultProps}
                disableStoreCredit={false}
                usableStoreCredit={100}
            />,
        );

        expect(
            screen.getByRole('checkbox', { name: 'Apply $112.00 store credit to order' }),
        ).toBeInTheDocument();
    });

    it('shows overlay if store credit can cover total cost of order', () => {
        jest.spyOn(defaultProps, 'isPaymentDataRequired').mockReturnValue(false);

        render(<PaymentFormTest {...defaultProps} usableStoreCredit={1000000} />);

        expect(
            screen.getByRole('checkbox', {
                name: 'Apply $1,120,000.00 store credit to order',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(localeContext.language.translate('payment.payment_not_required_text')),
        ).toBeInTheDocument();
    });

    it('does not show overlay if store credit cannot cover total cost of order', () => {
        render(<PaymentFormTest {...defaultProps} usableStoreCredit={1} />);

        expect(
            screen.getByRole('checkbox', {
                name: 'Apply $1.12 store credit to order',
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                localeContext.language.translate('payment.payment_not_required_text'),
            ),
        ).not.toBeInTheDocument();
    });

    describe('order extra fields', () => {
        const orderExtraFields: FormField[] = [
            {
                custom: false,
                default: 'default value',
                id: 'b2bExtraField_500',
                label: 'Order Note',
                name: 'b2bExtraField_500',
                required: true,
                fieldType: 'text',
                type: 'string',
            } as FormField,
        ];

        beforeEach(() => {
            sessionStorage.clear();
        });

        it('seeds inputs from session storage when stored values exist', () => {
            B2BSessionStorage.set(B2BSessionStorage.orderExtraFieldsKey, {
                b2bExtraField_500: 'restored value',
            });

            render(<PaymentFormTest {...defaultProps} orderExtraFields={orderExtraFields} />);

            expect(screen.getByDisplayValue('restored value')).toBeInTheDocument();
        });

        it('uses field default when session storage is empty', () => {
            render(<PaymentFormTest {...defaultProps} orderExtraFields={orderExtraFields} />);

            expect(screen.getByDisplayValue('default value')).toBeInTheDocument();
        });

        it('falls back to default when stored value has an unexpected type', () => {
            B2BSessionStorage.set(B2BSessionStorage.orderExtraFieldsKey, {
                b2bExtraField_500: { tampered: true },
            });

            render(<PaymentFormTest {...defaultProps} orderExtraFields={orderExtraFields} />);

            expect(screen.getByDisplayValue('default value')).toBeInTheDocument();
        });

        it('renders the order-extra-fields fieldset when fields are provided', () => {
            render(<PaymentFormTest {...defaultProps} orderExtraFields={orderExtraFields} />);

            expect(screen.getByTestId('order-extra-fields')).toBeInTheDocument();
        });

        it('does not render the fieldset when orderExtraFields is empty', () => {
            render(<PaymentFormTest {...defaultProps} orderExtraFields={[]} />);

            expect(screen.queryByTestId('order-extra-fields')).not.toBeInTheDocument();
        });

        it('does not render the fieldset when orderExtraFields prop is omitted', () => {
            render(<PaymentFormTest {...defaultProps} />);

            expect(screen.queryByTestId('order-extra-fields')).not.toBeInTheDocument();
        });
    });

    describe('invoice payment comment', () => {
        const enableCapability = () => {
            const storeConfig = getStoreConfig();

            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    capabilities: {
                        ...defaultCapabilities,
                        payment: {
                            ...defaultCapabilities.payment,
                            invoicePaymentComment: true,
                        },
                    },
                },
            });
        };

        beforeEach(() => {
            sessionStorage.clear();
        });

        it('renders the textarea when the capability is enabled', () => {
            enableCapability();

            render(<PaymentFormTest {...defaultProps} />);

            expect(screen.getByTestId('invoicePaymentComment-input')).toBeInTheDocument();
            expect(
                screen.getByText(
                    localeContext.language.translate('payment.invoice_payment_comment_label'),
                ),
            ).toBeInTheDocument();
        });

        it('does not render the textarea when the capability is disabled', () => {
            render(<PaymentFormTest {...defaultProps} />);

            expect(screen.queryByTestId('invoicePaymentComment-input')).not.toBeInTheDocument();
        });

        it('seeds the textarea from session storage when a value is stored', () => {
            enableCapability();
            B2BSessionStorage.set(B2BSessionStorage.invoiceCommentKey, 'restored comment');

            render(<PaymentFormTest {...defaultProps} />);

            expect(screen.getByDisplayValue('restored comment')).toBeInTheDocument();
        });

        it('writes typed values to session storage and strips them from the submit payload', async () => {
            enableCapability();

            const onSubmit = jest.fn();

            render(<PaymentFormTest {...defaultProps} onSubmit={onSubmit} />);

            fireEvent.change(screen.getByTestId('invoicePaymentComment-input'), {
                target: { value: 'note for invoice' },
            });

            expect(B2BSessionStorage.getValue(B2BSessionStorage.invoiceCommentKey)).toBe(
                'note for invoice',
            );

            fireEvent.submit(screen.getByTestId('payment-form'));

            await new Promise((resolve) => process.nextTick(resolve));

            expect(onSubmit).toHaveBeenCalledWith(
                expect.not.objectContaining({ invoicePaymentComment: expect.anything() }),
            );
        });
    });

    describe('additional payment field', () => {
        beforeEach(() => {
            sessionStorage.clear();
        });

        it('renders the field when the additionalField capability is set', () => {
            render(
                <PaymentFormTest
                    {...defaultProps}
                    additionalField={{ label: 'Order notes', required: false }}
                />,
            );

            expect(screen.getByTestId('additionalPaymentField-input')).toBeInTheDocument();
            expect(screen.getByText('Order notes')).toBeInTheDocument();
            expect(
                screen.getByText(localeContext.language.translate('common.optional_text')),
            ).toBeInTheDocument();
        });

        it('does not render the field when the additionalField capability is null', () => {
            render(<PaymentFormTest {...defaultProps} />);

            expect(screen.queryByTestId('additionalPaymentField-input')).not.toBeInTheDocument();
        });

        it('hides the optional hint when the field is required', () => {
            render(
                <PaymentFormTest
                    {...defaultProps}
                    additionalField={{ label: 'Order notes', required: true }}
                />,
            );

            expect(
                screen.queryByText(localeContext.language.translate('common.optional_text')),
            ).not.toBeInTheDocument();
        });

        it('seeds the field from session storage when a value is stored', () => {
            B2BSessionStorage.set(B2BSessionStorage.additionalPaymentFieldKey, 'restored note');

            render(
                <PaymentFormTest
                    {...defaultProps}
                    additionalField={{ label: 'Order notes', required: false }}
                />,
            );

            expect(screen.getByDisplayValue('restored note')).toBeInTheDocument();
        });

        it('writes typed values to session storage and strips them from the submit payload', async () => {
            const onSubmit = jest.fn();

            render(
                <PaymentFormTest
                    {...defaultProps}
                    additionalField={{ label: 'Order notes', required: false }}
                    onSubmit={onSubmit}
                />,
            );

            fireEvent.change(screen.getByTestId('additionalPaymentField-input'), {
                target: { value: 'special handling' },
            });

            expect(B2BSessionStorage.getValue(B2BSessionStorage.additionalPaymentFieldKey)).toBe(
                'special handling',
            );

            fireEvent.submit(screen.getByTestId('payment-form'));

            await new Promise((resolve) => process.nextTick(resolve));

            expect(onSubmit).toHaveBeenCalledWith(
                expect.not.objectContaining({ additionalPaymentField: expect.anything() }),
            );
        });

        it('blocks submit and shows a validation error when required and empty', async () => {
            const onSubmit = jest.fn();

            render(
                <PaymentFormTest
                    {...defaultProps}
                    additionalField={{ label: 'Order notes', required: true }}
                    onSubmit={onSubmit}
                />,
            );

            fireEvent.submit(screen.getByTestId('payment-form'));

            await new Promise((resolve) => process.nextTick(resolve));

            expect(onSubmit).not.toHaveBeenCalled();
            expect(
                screen.getByText(
                    localeContext.language.translate('payment.errors.field_required_error', {
                        label: 'Order notes',
                    }),
                ),
            ).toBeInTheDocument();
        });
    });
});
