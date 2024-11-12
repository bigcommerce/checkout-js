import '@testing-library/jest-dom';
import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React, { FunctionComponent } from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { CheckoutProvider, PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen, within } from '@bigcommerce/checkout/test-utils';

import { getAddressFormFields } from '../address/formField.mock';
import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import CheckoutStepType from '../checkout/CheckoutStepType';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { getConsignment } from '../shipping/consignment.mock';

import Shipping, { ShippingProps, WithCheckoutShippingProps } from './Shipping';
import { getShippingAddress } from './shipping-addresses.mock';

describe('Shipping component', () => {
    let localeContext: LocaleContextType;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: ShippingProps;
    let ComponentTest: FunctionComponent<ShippingProps> & Partial<WithCheckoutShippingProps>;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        checkoutService = createCheckoutService();

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
                    <ExtensionProvider checkoutService={checkoutService}>
                        <Shipping {...props} />
                    </ExtensionProvider>
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
                    features: {
                        ...getStoreConfig().checkoutSettings.features,
                        "PROJECT-4159.improve_multi_address_shipping_ui": true,
                    },
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

            await userEvent.click(within(confirmationModal).getByText('Confirm'));

            expect(defaultProps.onToggleMultiShipping).toHaveBeenCalled();
        });
    });
});
