import { CheckoutSelectors, CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render } from 'enzyme';
import { merge } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType, } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../config/config.mock';

import CheckoutButtonContainer from './CheckoutButtonContainer';
import { getCustomer, getGuestCustomer } from './customers.mock';

describe('CheckoutButtonContainer', () => {
    let localeContext: LocaleContextType;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    const paymentProviders = [
        'paypalcommerce',
        'paypalcommercecredit',
        'amazonpay',
        'googlepayauthorizenet',
    ];

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getGuestCustomer());
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(
            merge(getStoreConfig(), {
                checkoutSettings: {
                    checkoutUserExperienceSettings: {
                        walletButtonsOnTop: true,
                        floatingLabelEnabled: false,
                    },
                    remoteCheckoutProviders: paymentProviders,
                },
            }),
        );
    });

    it('displays wallet buttons for guest checkout', () => {
        const component = render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CheckoutButtonContainer
                        checkEmbeddedSupport={jest.fn()}
                        isPaymentStepActive={false}
                        onUnhandledError={jest.fn()}
                        onWalletButtonClick={jest.fn()}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );

        expect(component).toMatchSnapshot();
    });

    it('not displays wallet buttons for guest checkout if isPaymentDataRequired = false', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        const component = render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CheckoutButtonContainer
                        checkEmbeddedSupport={jest.fn()}
                        isPaymentStepActive={false}
                        onUnhandledError={jest.fn()}
                        onWalletButtonClick={jest.fn()}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );

        expect(component).toMatchSnapshot();
    });

    it('hides wallet buttons for signed-in shoppers', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        const component = render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CheckoutButtonContainer
                        checkEmbeddedSupport={jest.fn()}
                        isPaymentStepActive={false}
                        onUnhandledError={jest.fn()}
                        onWalletButtonClick={jest.fn()}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );

        expect(component).toMatchSnapshot();
    });

    it('hides wallet buttons with CSS when payment step is active', () => {
        const component = render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CheckoutButtonContainer
                        checkEmbeddedSupport={jest.fn()}
                        isPaymentStepActive={true}
                        onUnhandledError={jest.fn()}
                        onWalletButtonClick={jest.fn()}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );

        expect(component).toMatchSnapshot();
    });

    it('removes Paypal commerce wallet buttons when payment step is active', () => {
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(
            merge(getStoreConfig(), {
                checkoutSettings: {
                    checkoutUserExperienceSettings: {
                        walletButtonsOnTop: true,
                        floatingLabelEnabled: false,
                    },
                    remoteCheckoutProviders: paymentProviders,
                },
            }),
        );

        const component = render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CheckoutButtonContainer
                        checkEmbeddedSupport={jest.fn()}
                        isPaymentStepActive={true}
                        onUnhandledError={jest.fn()}
                        onWalletButtonClick={jest.fn()}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );

        expect(component).toMatchSnapshot();
    });
});
