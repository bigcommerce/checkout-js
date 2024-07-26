import React, { FunctionComponent } from 'react';
import { render, screen, configure } from '@testing-library/react';

import { FastlanePrivacySettings } from './';
import { CheckoutProvider } from "@bigcommerce/checkout/payment-integration-api";
import { WithCheckoutProps } from '../checkout';
import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService
} from '@bigcommerce/checkout-sdk';
import { getStoreConfig } from '../config/config.mock';

configure({
    testIdAttribute: 'data-test-id',
});

describe('FastlanePrivacySettings Component',() => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let FastlanePrivacySettingsComponent: FunctionComponent<WithCheckoutProps>;
    let defaultProps: WithCheckoutProps;
    beforeEach(() => {
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
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        defaultProps = {
            checkoutService,
            checkoutState,
        };

        jest.spyOn(checkoutState.data, 'getPaymentMethod').mockReturnValue(braintreeFastlanePaymentMethod);
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...config,
            checkoutSettings: {
                ...config.checkoutSettings,
                providerWithCustomCheckout: 'braintreeacceleratedcheckout',
            }
        });

         FastlanePrivacySettingsComponent = (props: WithCheckoutProps) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <FastlanePrivacySettings {...props} />
            </CheckoutProvider>
        );
    });

    it('renders fastlane privacy settings container', async () => {
        Object.defineProperty(window, 'braintreeFastlane', {
            value: {
                FastlaneWatermarkComponent: () => new Promise(resolve => resolve),
            },
        });
        render(<FastlanePrivacySettingsComponent {...defaultProps}/>);

        const fastlanePrivacySettingsDiv = await screen.findAllByTestId('fastlanePrivacySettings');

        expect(fastlanePrivacySettingsDiv[0]).toBeInTheDocument();
    });

    it('renders braintreefastlane privacy settings', async () => {
        const render = jest.fn();

        render(<FastlanePrivacySettingsComponent {...defaultProps}/>);

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

        render(<FastlanePrivacySettingsComponent {...defaultProps}/>);

        expect(render).toHaveBeenCalled();
    });
});