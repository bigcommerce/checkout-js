import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getCart } from '../cart/carts.mock';
import { createErrorLogger } from '../common/error';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import { getPaymentMethod } from './payment-methods.mock';
import PaymentContext, { type PaymentContextProps } from './PaymentContext';
import PaymentForm, { type PaymentFormProps } from './PaymentForm';

jest.useFakeTimers({ legacyFakeTimers: true });

describe('PaymentForm', () => {
    let checkoutService: CheckoutService;
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
                            <ExtensionProvider checkoutService={checkoutService} errorLogger={createErrorLogger()}>
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
        expect(screen.getAllByText('Authorizenet')).toHaveLength(3);  // 2 radio buttons + 1 title for a11y (hidden) 
        expect(screen.getByText(localeContext.language.translate('payment.place_order_action'))).toBeInTheDocument();
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

        expect(screen.getByText(
            localeContext.language.translate('terms_and_conditions.terms_and_conditions_heading'),
        )).toBeInTheDocument();
        expect(screen.getByText(
            localeContext.language.translate('terms_and_conditions.agreement_text'),
        )).toBeInTheDocument();
        expect(screen.getByText(
            textAcceptTerms,
        )).toBeInTheDocument();
    });

    it('renders terms and conditions field if terms URL is provided', () => {
        const url = "https://foobar.com/terms";

        render(
            <PaymentFormTest
                {...defaultProps}
                isTermsConditionsRequired={true}
                termsConditionsUrl={url}
            />,
        );

        expect(screen.getByText(
            localeContext.language.translate('terms_and_conditions.terms_and_conditions_heading'),
        )).toBeInTheDocument();
        expect(screen.getByRole(
            'link', { name: 'terms and conditions' },
        )).toHaveAttribute("href", url);
    });

    it('does not render terms and conditions field if it is not required', () => {
        render(<PaymentFormTest {...defaultProps} />);

        expect(screen.queryByText(
            localeContext.language.translate('terms_and_conditions.terms_and_conditions_heading'),
        )).not.toBeInTheDocument();
    });

    it('renders spam protection field if spam check should be executed', () => {
        render(
            <PaymentFormTest {...defaultProps} shouldExecuteSpamCheck={true} />,
        );

        expect(document.querySelector('.loadingOverlay-container')).toBeInTheDocument();
        expect(document.querySelector('.spamProtection-container')).toBeInTheDocument();
    });

    it('renders store credit field if store credit can be applied', () => {
        render(<PaymentFormTest {...defaultProps} usableStoreCredit={100} />);

        expect(screen.getByRole('checkbox', {
            name: 'Apply $112.00 store credit to order',
        })).toBeInTheDocument();
        expect(screen.getByText(/Apply/)).toBeInTheDocument();
        expect(screen.getByText('$112.00')).toBeInTheDocument();
        expect(screen.getByText(/store credit to order/)).toBeInTheDocument();
    });

    it('does not render store credit field if store credit cannot be applied', () => {
        render(<PaymentFormTest {...defaultProps} />);

        expect(screen.queryByText(/store credit/)).not.toBeInTheDocument();
    });

    it('shows overlay if store credit can cover total cost of order', () => {
        jest.spyOn(defaultProps, 'isPaymentDataRequired').mockReturnValue(false);

        render(<PaymentFormTest {...defaultProps} usableStoreCredit={1000000} />);

        expect(screen.getByRole('checkbox', {
            name: 'Apply $1,120,000.00 store credit to order',
        })).toBeInTheDocument();
        expect(screen.getByText(
            localeContext.language.translate('payment.payment_not_required_text'),
        )).toBeInTheDocument();
    });

    it('does not show overlay if store credit cannot cover total cost of order', () => {
        render(<PaymentFormTest {...defaultProps} usableStoreCredit={1} />);

        expect(screen.getByRole('checkbox', {
            name: 'Apply $1.12 store credit to order',
        })).toBeInTheDocument();
        expect(screen.queryByText(
            localeContext.language.translate('payment.payment_not_required_text'),
        )).not.toBeInTheDocument();
    });
});
