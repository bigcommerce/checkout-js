import { createCheckoutService, CheckoutService, LanguageService } from '@bigcommerce/checkout-sdk';
import { mount, render } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../checkout';
import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';
import { Button } from '../ui/button';
import { IconBolt } from '../ui/icon';

import CustomPaymentSubmitButton, { CustomPaymentSubmitButtonProps } from './CustomPaymentSubmitButton';

describe('PaymentSubmitButton', () => {
    let PaymentSubmitButtonTest: FunctionComponent<CustomPaymentSubmitButtonProps>;
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
                    <CustomPaymentSubmitButton { ...props } />
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

    it('renders button with default label when no custom contents are available', () => {
        const component = mount(
            <PaymentSubmitButtonTest />
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.place_order_action'));
    });

    it('renders button with special contents for Bolt', () => {
        const component = mount(
            <PaymentSubmitButtonTest methodId="bolt" />
        );

        expect(component.text())
            .toEqual(languageService.translate('payment.bolt_continue_action'));
        expect(component.find(IconBolt).length)
            .toEqual(1);
    });
});
