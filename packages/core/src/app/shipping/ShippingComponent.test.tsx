import '@testing-library/jest-dom';
import {
    type Cart,
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React, { type FunctionComponent } from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { AnalyticsProviderMock } from '@bigcommerce/checkout/contexts';
import { type ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { CheckoutProvider, PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen, within } from '@bigcommerce/checkout/test-utils';

import { getAddressFormFields } from '../address/formField.mock';
import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import CheckoutStepType from '../checkout/CheckoutStepType';
import { createErrorLogger } from '../common/error';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { getConsignment } from '../shipping/consignment.mock';

import Shipping, { type ShippingProps, type WithCheckoutShippingProps } from './Shipping';
import { getShippingAddress } from './shipping-addresses.mock';

describe('Shipping component', () => {
    let localeContext: LocaleContextType;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: ShippingProps;
    let ComponentTest: FunctionComponent<ShippingProps> & Partial<WithCheckoutShippingProps>;
    let errorLogger: ErrorLogger;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        checkoutService = createCheckoutService();
        errorLogger = createErrorLogger();
        checkoutState = checkoutService.getState();

        defaultProps = {
            isBillingSameAsShipping: true,
            isMultiShippingMode: false,
            onToggleMultiShipping: jest.fn(),
            cartHasChanged: false,
            onSignIn: jest.fn(),
            step: {
                isActive: true,
                isComplete: true,
                isEditable: true,
                isRequired: true,
                type: CheckoutStepType.Shipping
            },
            providerWithCustomCheckout: PaymentMethodId.StripeUPE,
            isShippingMethodLoading: true,
            navigateNextStep: jest.fn(),
            onUnhandledError: jest.fn(),
        };

        jest.spyOn(checkoutService, 'loadShippingAddressFields').mockResolvedValue(
            {} as CheckoutSelectors,
        );

        jest.spyOn(checkoutService, 'loadBillingAddressFields').mockResolvedValue(
            {} as CheckoutSelectors,
        );

        jest.spyOn(checkoutService, 'loadShippingOptions').mockResolvedValue(
            {} as CheckoutSelectors,
        );

        jest.spyOn(checkoutService, 'deleteConsignment').mockResolvedValue({} as CheckoutSelectors);

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
            ...getCart(),
            lineItems: {
                ...getCart().lineItems,
                physicalItems: [
                    {
                        ...getPhysicalItem(),
                        quantity: 3,
                    },
                ],
            },
        } as Cart);

        jest.spyOn(checkoutState.data, 'getShippingAddress').mockReturnValue(getShippingAddress());

        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(undefined);

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getShippingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
            addresses: [],
        });

        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutService, 'updateBillingAddress').mockResolvedValue(
            {} as CheckoutSelectors,
        );
        jest.spyOn(checkoutService, 'updateCheckout').mockResolvedValue({} as CheckoutSelectors);
        jest.spyOn(checkoutService, 'updateShippingAddress').mockResolvedValue(
            {} as CheckoutSelectors,
        );

        ComponentTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <AnalyticsProviderMock>
                        <ExtensionProvider checkoutService={checkoutService} errorLogger={errorLogger} >
                            <Shipping {...props} />
                        </ExtensionProvider>
                    </AnalyticsProviderMock>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    describe('when new multishipping ui is enabled', () => {
        beforeEach(async () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                ...getStoreConfig(),
                checkoutSettings: {
                    ...getStoreConfig().checkoutSettings,
                    hasMultiShippingEnabled: true,
                },
            });
        });

        it('opens confirmation dialog on clicking the link and calls onToggleMultiShipping when confirm is clicked', async () => {
            render(<ComponentTest {...defaultProps} isMultiShippingMode={true} />);

            const shippingModeToggle = await screen.findByTestId("shipping-mode-toggle");

            expect(shippingModeToggle.innerHTML).toBe('Ship to a single address');

            await userEvent.click(shippingModeToggle);

            const confirmationModal = await screen.findByRole('dialog');

            expect(confirmationModal).toBeInTheDocument();
            expect(within(confirmationModal).getByText(localeContext.language.translate('shipping.ship_to_single_action'))).toBeInTheDocument();
            expect(within(confirmationModal).getByText(localeContext.language.translate('shipping.ship_to_single_message'))).toBeInTheDocument();

            await userEvent.click(within(confirmationModal).getByText(localeContext.language.translate('common.proceed_action')));

            expect(defaultProps.onToggleMultiShipping).toHaveBeenCalled();
        });

        it('opens information dialog on clicking `ship to multiple address` when promotional item is present in the cart', async () => {
            jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [
                        {
                            ...getPhysicalItem(),
                            quantity: 3,
                        },
                        {
                            ...getPhysicalItem(),
                            id: '123',
                            quantity: 1,
                            addedByPromotion: true,
                        }
                    ],
                },
            } as Cart);
            
            render(<ComponentTest {...defaultProps} isMultiShippingMode={false} />);

            const shippingModeToggle = await screen.findByTestId("shipping-mode-toggle");

            expect(shippingModeToggle.innerHTML).toBe(localeContext.language.translate('shipping.ship_to_multi'));

            await userEvent.click(shippingModeToggle);

            const confirmationModal = await screen.findByRole('dialog');

            expect(confirmationModal).toBeInTheDocument();
            expect(within(confirmationModal).getByText(localeContext.language.translate('shipping.multishipping_unavailable_action'))).toBeInTheDocument();
            expect(within(confirmationModal).getByText(localeContext.language.translate('shipping.multishipping_unavailable_message'))).toBeInTheDocument();

            await userEvent.click(within(confirmationModal).getByText(localeContext.language.translate('common.back_action')));

            expect(defaultProps.onToggleMultiShipping).not.toHaveBeenCalled();
        });

        it('opens information dialog on mount and when multishipping mode is ON and promotional item is present in the cart', async () => {
            jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [
                        {
                            ...getPhysicalItem(),
                            quantity: 3,
                        },
                        {
                            ...getPhysicalItem(),
                            id: '123',
                            quantity: 1,
                            addedByPromotion: true,
                        }
                    ],
                },
            } as Cart);
            
            render(<ComponentTest {...defaultProps} isMultiShippingMode={true} />);

            const confirmationModal = await screen.findByRole('dialog');

            expect(confirmationModal).toBeInTheDocument();
            expect(within(confirmationModal).getByText(localeContext.language.translate('shipping.multishipping_unavailable_action'))).toBeInTheDocument();
            expect(within(confirmationModal).getByText(localeContext.language.translate('shipping.checkout_switched_to_single_shipping'))).toBeInTheDocument();

            await userEvent.click(within(confirmationModal).getByText(localeContext.language.translate('common.ok_action')));

            expect(defaultProps.onToggleMultiShipping).toHaveBeenCalled();
        });

        it('does not show `ship to multiple address` if only 1 bundled product is present in the cart', async () => {
            jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
                ...getCart(),
                lineItems: {
                    physicalItems: [
                        {
                            ...getPhysicalItem(),
                        },
                        {
                            ...getPhysicalItem(),
                            id: '123',
                            parentId: getPhysicalItem().id,
                        }
                    ],
                },
            } as Cart);

            render(<ComponentTest {...defaultProps} isMultiShippingMode={false} />);

            expect(screen.queryByTestId("shipping-mode-toggle")).not.toBeInTheDocument();
        });
    });

    it('disables continue button when checkout is loading', () => {
        jest.spyOn(checkoutState.statuses, 'isLoadingCheckout').mockReturnValue(true);

        render(<ComponentTest {...defaultProps} />);

        expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    });
});
