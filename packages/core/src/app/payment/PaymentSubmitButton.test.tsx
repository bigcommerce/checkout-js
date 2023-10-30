import { CheckoutService, createCheckoutService, LanguageService } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import { PaymentMethodId, PaymentMethodType } from './paymentMethod';
import PaymentSubmitButton, { PaymentSubmitButtonProps } from './PaymentSubmitButton';

describe('PaymentSubmitButton', () => {
    let PaymentSubmitButtonTest: FunctionComponent<PaymentSubmitButtonProps>;
    let checkoutService: CheckoutService;
    let languageService: LanguageService;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());
        languageService = localeContext.language;

        PaymentSubmitButtonTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentSubmitButton
                    isPaymentDataRequired
                    {...props}
                />
            </CheckoutProvider>
        );
    });

    it('renders button with default label', () => {
        render(<PaymentSubmitButtonTest />);

        expect(screen.getByText(languageService.translate('payment.place_order_action'))).toBeInTheDocument();
    });

    it('renders button with default label if payment data is not required', () => {
        render(<PaymentSubmitButtonTest isPaymentDataRequired={false} />);

        expect(screen.getByText(languageService.translate('payment.place_order_action'))).toBeInTheDocument();
    });

    it('renders button with special label for Amazon Pay', () => {
        render(<PaymentSubmitButtonTest methodId="amazonpay" />);

        expect(screen.getByText(languageService.translate('payment.amazonpay_continue_action'))).toBeInTheDocument();
    });

    it('renders button with special label and icon for Bolt', () => {
        render(<PaymentSubmitButtonTest methodId="bolt" />);

        expect(screen.getByTestId('bolt-icon')).toBeInTheDocument();
        expect(screen.getByText('Bolt')).toBeInTheDocument();
        expect(screen.getByText(languageService.translate('payment.place_order_action'))).toBeInTheDocument();
    });

    it('renders button with special label for Barclaycard', () => {
        render(<PaymentSubmitButtonTest methodGateway="barclaycard" />);

        expect(screen.getByText(languageService.translate('payment.barclaycard_continue_action'))).toBeInTheDocument();
    });

    it('renders button with special label for Visa Checkout provided by Braintree', () => {
        render(<PaymentSubmitButtonTest methodType="visa-checkout" />);

        expect(screen.getByText(languageService.translate('payment.visa_checkout_continue_action'))).toBeInTheDocument();
    });

    it('renders button with special label for ChasePay', () => {
        render(<PaymentSubmitButtonTest methodType="chasepay" />);

        expect(screen.getByText(languageService.translate('payment.chasepay_continue_action'))).toBeInTheDocument();
    });

    it('renders button with special label for Opy', () => {
        render(<PaymentSubmitButtonTest methodId="opy" methodName="Opy" />);

        expect(screen.getByText(languageService.translate('payment.opy_continue_action', { methodName: 'Opy' }))).toBeInTheDocument();
    });

    it('renders button with special label for PayPal', () => {
        render(<PaymentSubmitButtonTest isComplete={true} methodType="paypal" />);

        expect(screen.getByText(languageService.translate('payment.paypal_complete_action'))).toBeInTheDocument();
    });

    it('renders button with special label for PayPal when the order placement starts on checkout page', () => {
        render(<PaymentSubmitButtonTest methodType="paypal" />);

        expect(screen.getByText(languageService.translate('payment.paypal_continue_action'))).toBeInTheDocument();
    });

    it('renders button with special label for Braintree Venmo', () => {
        render(
            <PaymentSubmitButtonTest
                methodId={PaymentMethodId.BraintreeVenmo}
                methodType="paypal"
            />,
        );

        expect(screen.getByText(languageService.translate('payment.paypal_venmo_continue_action'))).toBeInTheDocument();
    });

    it('renders button with special label for PayPal Venmo', () => {
        render(<PaymentSubmitButtonTest methodType={PaymentMethodType.PaypalVenmo} />);

        expect(screen.getByText(languageService.translate('payment.paypal_venmo_continue_action'))).toBeInTheDocument();
    });

    it('renders button with special label for PayPal Credit', () => {
        render(<PaymentSubmitButtonTest isComplete={true} methodType="paypal-credit" />);

        expect(screen.getByText(languageService.translate('payment.paypal_pay_later_complete_action'))).toBeInTheDocument();
    });

    it('renders button with special label for PayPal Credit when the order placement starts on checkout page', () => {
        render(<PaymentSubmitButtonTest methodType="paypal-credit" />);

        expect(screen.getByText(languageService.translate('payment.paypal_pay_later_continue_action'))).toBeInTheDocument();
    });

    it('renders button with special label for Quadpay', () => {
        render(<PaymentSubmitButtonTest methodId="quadpay" />);

        expect(screen.getByText(languageService.translate('payment.quadpay_continue_action'))).toBeInTheDocument();
    });

    it('renders button with special label for Zip', () => {
        render(<PaymentSubmitButtonTest methodId="zip" />);

        expect(screen.getByText(languageService.translate('payment.zip_continue_action'))).toBeInTheDocument();
    });

    it('renders button with label of "Continue with ${methodName}"', () => {
        render(
            <PaymentSubmitButtonTest initialisationStrategyType="none" methodName="Foo" />,
        );

        expect(screen.getByText(languageService.translate('payment.ppsdk_continue_action', { methodName: 'Foo' }))).toBeInTheDocument();
    });
});
