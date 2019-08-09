import { LanguageService } from '@bigcommerce/checkout-sdk';
import { mount, shallow } from 'enzyme';
import React from 'react';

import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';
import { Button } from '../ui/button';

import PaymentSubmitButton from './PaymentSubmitButton';

describe('PaymentSubmitButton', () => {
    let localeContext: LocaleContextType;
    let languageService: LanguageService;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        languageService = localeContext.language;
    });

    it('matches snapshot with rendered output', () => {
        const component = shallow(<PaymentSubmitButton />);

        expect(component)
            .toMatchSnapshot();
    });

    it('forwards props to button', () => {
        const component = shallow(
            <PaymentSubmitButton
                isDisabled
                isLoading
            />
        );

        expect(component.find(Button).props())
            .toEqual(expect.objectContaining({
                disabled: true,
                isLoading: true,
            }));
    });

    it('renders button with default label', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <PaymentSubmitButton />
            </LocaleContext.Provider>
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.place_order_action'));
    });

    it('renders button with special label for Amazon', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <PaymentSubmitButton methodId="amazon" />
            </LocaleContext.Provider>
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.amazon_continue_action'));
    });

    it('renders button with special label for Visa Checkout provided by Braintree', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <PaymentSubmitButton methodType="visa-checkout" />
            </LocaleContext.Provider>
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.visa_checkout_continue_action'));
    });

    it('renders button with special label for ChasePay', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <PaymentSubmitButton methodType="chasepay" />
            </LocaleContext.Provider>
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.chasepay_continue_action'));
    });

    it('renders button with special label for PayPal', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <PaymentSubmitButton methodType="paypal" />
            </LocaleContext.Provider>
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.paypal_continue_action'));
    });

    it('renders button with special label for PayPal Credit', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <PaymentSubmitButton methodType="paypal-credit" />
            </LocaleContext.Provider>
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.paypal_credit_continue_action'));
    });
});
