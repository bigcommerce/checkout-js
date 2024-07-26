import { configure, render, screen } from '@testing-library/react';
import React, { FunctionComponent } from 'react';

import { getStoreConfig } from '../config/config.mock';
import { EmailWatermark } from './';
import {CheckoutContext, CheckoutProvider} from "@bigcommerce/checkout/payment-integration-api";
import { WithCheckoutProps } from '../checkout';
import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';

configure({
    testIdAttribute: 'data-test-id',
});

describe('EmailWatermark Component',() => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let EmailWatermarkComponent: FunctionComponent<WithCheckoutProps>;
    let defaultProps: WithCheckoutProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        defaultProps = {
            checkoutService,
            checkoutState,
        };

        EmailWatermarkComponent = () => (
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <CheckoutProvider checkoutService={checkoutService}>
                    <EmailWatermark />
                </CheckoutProvider>
            </CheckoutContext.Provider>
        );
    });

    it('renders fastlane privacy settings container', async () => {
        const braintreeFastlanePaymentMethod =  {
            id: 'braintreeacceleratedcheckout',
            logoUrl: '',
            method: 'braintreeacceleratedcheckout',
            supportedCards: [],
            config: {
                testMode: true,
            },
            initializationData: {
                isFastlanePrivacySettingEnabled: true,
            },
            type: 'PAYMENT_TYPE_API',
            clientToken: 'clientToken',
        };
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                providerWithCustomCheckout: 'braintreeacceleratedcheckout',
            }
        });
        jest.spyOn(checkoutState.data, 'getPaymentMethod').mockReturnValue(braintreeFastlanePaymentMethod);
        Object.defineProperty(window, 'braintreeFastlane', {
            value: {
                FastlaneWatermarkComponent: () => new Promise(resolve => resolve),
            },
        });

        render(<EmailWatermarkComponent {...defaultProps}/>);

        const fastlanePrivacySettingsDiv = await screen.findAllByTestId('emailWatermark');

        expect(fastlanePrivacySettingsDiv[0]).toBeInTheDocument();
    });

    it('renders braintreefastlane privacy settings', async () => {
        const render = jest.fn();
        const config = getStoreConfig();
        const braintreeFastlanePaymentMethod =  {
            id: 'braintreeacceleratedcheckout',
            logoUrl: '',
            method: 'braintreeacceleratedcheckout',
            supportedCards: [],
            config: {
                testMode: true,
            },
            initializationData: {
                isFastlanePrivacySettingEnabled: true,
            },
            type: 'PAYMENT_TYPE_API',
            clientToken: 'clientToken',
        };

        jest.spyOn(checkoutState.data, 'getPaymentMethod').mockReturnValue(braintreeFastlanePaymentMethod);
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...config,
            checkoutSettings: {
                ...config.checkoutSettings,
                providerWithCustomCheckout: 'braintreeacceleratedcheckout',
            }
        });
        render(<EmailWatermarkComponent {...defaultProps}/>);

        expect(render).toHaveBeenCalled();
    });

    it('renders paypalfastlane privacy settings', async () => {
        const render = jest.fn();
        const config = getStoreConfig();
        const paypalFastlanePaymentMethod =  {
            id: 'paypalcommerceacceleratedcheckout',
            logoUrl: '',
            method: 'paypalcommerceacceleratedcheckout',
            supportedCards: [],
            config: {
                testMode: true,
            },
            initializationData: {
                isFastlanePrivacySettingEnabled: true,
            },
            type: 'PAYMENT_TYPE_API',
            clientToken: 'clientToken',
        };

        jest.spyOn(checkoutState.data, 'getPaymentMethod').mockReturnValue(paypalFastlanePaymentMethod);
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...config,
            checkoutSettings: {
                ...config.checkoutSettings,
                providerWithCustomCheckout: 'paypalcommerceacceleratedcheckout',
            }
        });
        Object.defineProperty(window, 'paypalFastlane', {
            value: {
                FastlaneWatermarkComponent: () => new Promise(() => render()),
            },
        });

        render(<EmailWatermarkComponent {...defaultProps}/>);

        expect(render).toHaveBeenCalled();
    });
});
