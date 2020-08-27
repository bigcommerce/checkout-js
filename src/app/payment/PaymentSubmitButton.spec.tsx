import { createCheckoutService, CheckoutService, LanguageService } from '@bigcommerce/checkout-sdk';
import { mount, render } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../checkout';
import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';
import { Button } from '../ui/button';

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

        PaymentSubmitButtonTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <LocaleContext.Provider value={ localeContext }>
                    <PaymentSubmitButton { ...props } />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('matches snapshot with rendered output', () => {
        const component = render(
            <PaymentSubmitButtonTest />
        );

        expect(component)
            .toMatchSnapshot();
    });

    it('forwards props to button', () => {
        const component = mount(
            <PaymentSubmitButtonTest isDisabled />
        );

        expect(component.find(Button).props())
            .toEqual(expect.objectContaining({
                disabled: true,
            }));
    });

    it('renders button with default label', () => {
        const component = mount(
            <PaymentSubmitButtonTest />
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.place_order_action'));
    });

    it('renders button with special label for Amazon', () => {
        const component = mount(
            <PaymentSubmitButtonTest methodId="amazon" />
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.amazon_continue_action'));
    });

    it('renders button with special label for Amazon Pay', () => {
        const component = mount(
            <PaymentSubmitButtonTest methodId="amazon" />
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.amazonpay_continue_action'));
    });

    it('renders button with special label for Bolt', () => {
        const component = mount(
            <PaymentSubmitButtonTest methodId="bolt" />
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.bolt_continue_action'));
    });

    it('renders button with special label for Barclaycard', () => {
        const component = mount(
            <PaymentSubmitButtonTest methodGateway="barclaycard" />
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.barclaycard_continue_action'));
    });

    it('renders button with special label for Visa Checkout provided by Braintree', () => {
        const component = mount(
            <PaymentSubmitButtonTest methodType="visa-checkout" />
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.visa_checkout_continue_action'));
    });

    it('renders button with special label for ChasePay', () => {
        const component = mount(
            <PaymentSubmitButtonTest methodType="chasepay" />
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.chasepay_continue_action'));
    });

    it('renders button with special label for PayPal', () => {
        const component = mount(
            <PaymentSubmitButtonTest methodType="paypal" />
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.paypal_continue_action'));
    });

    it('renders button with special label for PayPal Credit', () => {
        const component = mount(
            <PaymentSubmitButtonTest methodType="paypal-credit" />
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.paypal_credit_continue_action'));
    });
});
