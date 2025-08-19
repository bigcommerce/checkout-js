import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import React, { type FunctionComponent } from 'react';

import { CheckoutContext, CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import isFastlaneHostWindow from './is-fastlane-window';
import PayPalFastlaneWatermark from './PayPalFastlaneWatermark';

describe('PayPalFastlaneWatermark Component', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let PayPalFastlaneWatermarkComponent: FunctionComponent;

    const paymentMethodDataMock = {
        logoUrl: '',
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

    Object.defineProperties(window, {
        braintreeFastlane: {
            value: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                FastlaneWatermarkComponent: jest.fn(),
            },
            configurable: true,
        },
        paypalFastlane: {
            value: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                FastlaneWatermarkComponent: jest.fn(),
            },
            configurable: true,
        },
    });

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        PayPalFastlaneWatermarkComponent = () => (
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <CheckoutProvider checkoutService={checkoutService}>
                    <PayPalFastlaneWatermark />
                </CheckoutProvider>
            </CheckoutContext.Provider>
        );
    });

    describe('braintree fastlane privacy settings', () => {
        beforeEach(() => {
            const braintreeFastlanePaymentMethod = {
                ...paymentMethodDataMock,
                id: 'braintreeacceleratedcheckout',
                method: 'braintreeacceleratedcheckout',
            };

            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                ...getStoreConfig(),
                checkoutSettings: {
                    ...getStoreConfig().checkoutSettings,
                    providerWithCustomCheckout: 'braintreeacceleratedcheckout',
                },
            });
            jest.spyOn(checkoutState.data, 'getPaymentMethod').mockReturnValue(
                braintreeFastlanePaymentMethod,
            );
        });

        it('renders fastlane privacy settings container', async () => {
            const text = 'BigCommerce Braintree Fastlane';

            if (isFastlaneHostWindow(window)) {
                jest.spyOn(
                    window.braintreeFastlane,
                    'FastlaneWatermarkComponent',
                ).mockReturnValueOnce(
                    new Promise((resolve) => {
                        resolve({
                            render: (containerId) => {
                                // eslint-disable-next-line testing-library/no-node-access
                                const container = document.querySelector(containerId);

                                if (container) {
                                    container.append(text);
                                }
                            },
                        });
                    }),
                );
            }

            render(<PayPalFastlaneWatermarkComponent />);

            expect(await screen.findByText(text)).toBeInTheDocument();
        });

        it('renders braintree fastlane privacy settings', async () => {
            const renderWatermark = jest.fn();

            if (isFastlaneHostWindow(window)) {
                jest.spyOn(
                    window.braintreeFastlane,
                    'FastlaneWatermarkComponent',
                ).mockReturnValueOnce(
                    new Promise((resolve) => {
                        resolve({
                            render: renderWatermark,
                        });
                    }),
                );
            }

            render(<PayPalFastlaneWatermarkComponent />);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(renderWatermark).toHaveBeenCalled();
        });
    });

    describe('paypal commerce fastlane privacy settings', () => {
        beforeEach(() => {
            const paypalCommerceFastlanePaymentMethod = {
                ...paymentMethodDataMock,
                id: 'paypalcommerceacceleratedcheckout',
                method: 'paypalcommerceacceleratedcheckout',
            };

            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                ...getStoreConfig(),
                checkoutSettings: {
                    ...getStoreConfig().checkoutSettings,
                    providerWithCustomCheckout: 'paypalcommerceacceleratedcheckout',
                },
            });
            jest.spyOn(checkoutState.data, 'getPaymentMethod').mockReturnValue(
                paypalCommerceFastlanePaymentMethod,
            );
        });

        it('renders fastlane privacy settings container', async () => {
            const text = 'BigCommerce PayPal Commerce Fastlane';

            if (isFastlaneHostWindow(window)) {
                jest.spyOn(window.paypalFastlane, 'FastlaneWatermarkComponent').mockReturnValueOnce(
                    new Promise((resolve) => {
                        resolve({
                            render: (containerId) => {
                                // eslint-disable-next-line testing-library/no-node-access
                                const container = document.querySelector(containerId);

                                if (container) {
                                    container.append(text);
                                }
                            },
                        });
                    }),
                );
            }

            render(<PayPalFastlaneWatermarkComponent />);

            expect(await screen.findByText(text)).toBeInTheDocument();
        });

        it('renders paypal fastlane privacy settings', async () => {
            const renderWatermark = jest.fn();

            if (isFastlaneHostWindow(window)) {
                jest.spyOn(window.paypalFastlane, 'FastlaneWatermarkComponent').mockReturnValue(
                    new Promise((resolve) => {
                        resolve({
                            render: renderWatermark,
                        });
                    }),
                );
            }

            render(<PayPalFastlaneWatermarkComponent />);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(renderWatermark).toHaveBeenCalled();
        });
    });
});
