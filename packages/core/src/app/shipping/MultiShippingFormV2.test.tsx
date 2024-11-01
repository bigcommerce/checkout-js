import '@testing-library/jest-dom';
import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen, waitFor, within } from '@bigcommerce/checkout/test-utils';

import { getAddressFormFields } from '../address/formField.mock';
import { getAddressContent } from '../address/SingleLineStaticAddress';
import { getCart } from '../cart/carts.mock';
import { getCustomItem, getPhysicalItem } from '../cart/lineItem.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import { getConsignment } from './consignment.mock';
import MultiShippingFormV2, { MultiShippingFormV2Props } from './MultiShippingFormV2';
import { getShippingAddress } from './shipping-addresses.mock';

describe('MultiShippingFormV2 Component', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: MultiShippingFormV2Props;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        defaultProps = {
            customerMessage: 'x',
            countriesWithAutocomplete: [],
            isLoading: false,
            onCreateAccount: jest.fn(),
            onSignIn: jest.fn(),
            onUnhandledError: jest.fn(),
            onSubmit: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getBillingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );

        jest.spyOn(checkoutState.data, 'getShippingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );

        jest.spyOn(checkoutState.data, 'getShippingAddress').mockReturnValue(getShippingAddress());

        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(undefined);

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
            ...getCheckout(),
            consignments: [{
                ...getConsignment(),
                lineItemIds: [getPhysicalItem().id],
            }],
        });
    });

    it('renders shipping destination 1', async () => {
        const address = getShippingAddress();

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider checkoutService={checkoutService}>
                        <MultiShippingFormV2 {...defaultProps} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.getByText('Destination #1')).toBeInTheDocument();
        expect(screen.getByText(getAddressContent(address))).toBeInTheDocument();

        // eslint-disable-next-line testing-library/no-node-access
        const destination1 = screen.getByText('Destination #1').parentElement;

        expect(within(destination1).getByText('Canvas Laundry Cart', { exact: false })).toBeInTheDocument();

        const showItemsButton = screen.getByTestId('expand-items-button');

        expect(showItemsButton).toBeInTheDocument();
        await userEvent.click(showItemsButton);

        await waitFor(() => {
            expect(within(destination1).queryByText('Canvas Laundry Cart', { exact: false })).not.toBeInTheDocument();
        });
    });

    it('adds new shipping destination and open allocate items modal and validate quantity input', async () => {
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
            ...getCheckout(),
            consignments: [{
                ...getConsignment(),
                lineItemIds: ['1']
            }],
            cart: {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [{
                        ...getPhysicalItem(),
                        id: '1',
                        name: 'Product 1',
                        quantity: 2,
                    },
                    {
                        ...getPhysicalItem(),
                        id: '2',
                        name: 'Product 2',
                        quantity: 1,
                    }],
                    customItems: [getCustomItem()],
                },
            },
        });

        const address = getShippingAddress();

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider checkoutService={checkoutService}>
                        <MultiShippingFormV2 {...defaultProps} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.getByText('Destination #1')).toBeInTheDocument();
        expect(screen.getByText(getAddressContent(address))).toBeInTheDocument();

        expect(screen.getByText('3 items left to allocate')).toBeInTheDocument();

        const addShippingDestinationButton = screen.getByRole('button', { name: 'Add new destination' });

        expect(addShippingDestinationButton).toBeInTheDocument();
        await userEvent.click(addShippingDestinationButton);

        expect(screen.getByText('Destination #2')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('No items allocated')).not.toBeInTheDocument();
        });

        // eslint-disable-next-line testing-library/no-node-access
        const destination2 = screen.getByText('Destination #2').parentElement;
        const addressSelectButton = within(destination2).getByTestId('address-select-button');

        await userEvent.click(addressSelectButton);

        // eslint-disable-next-line testing-library/no-node-access
        const addressOption = screen.getAllByTestId('address-select-option')[0].firstChild;

        expect(addressOption).toBeInTheDocument();

        if (addressOption) {
            await userEvent.click(addressOption);
        }

        expect(screen.getByText('No items allocated')).toBeInTheDocument();

        const allocateItemsButton = screen.getByTestId('allocate-items-button');

        expect(allocateItemsButton).toBeInTheDocument();
        await userEvent.click(allocateItemsButton);

        const allocateItemsModal = screen.getByRole('dialog');

        expect(allocateItemsModal).toBeInTheDocument();

        const allocateItemsModalHeader = within(allocateItemsModal).getByText('Destination #2');

        expect(allocateItemsModalHeader).toBeInTheDocument();

        expect(screen.getByText('Shipping isn\'t required for digital products, thus it\'s not displayed here.')).toBeInTheDocument();

        await waitFor(() => {
            expect(within(allocateItemsModal).queryByText('Product 1')).not.toBeInTheDocument();
        });
        expect(within(allocateItemsModal).getByText('Product 2')).toBeInTheDocument();

        const physicalItemQuantityInput = within(allocateItemsModal).getByLabelText('Quantity of Product 2');

        expect(physicalItemQuantityInput).toBeInTheDocument();
        expect(physicalItemQuantityInput).toHaveValue(0);
        expect(within(allocateItemsModal).getByRole('button', { name: 'Allocate' })).toBeDisabled();

        await userEvent.type(physicalItemQuantityInput, '5');

        expect(physicalItemQuantityInput).toHaveValue(5);
        expect(within(allocateItemsModal).getByRole('button', { name: 'Allocate' })).toBeEnabled();

        await userEvent.click(within(allocateItemsModal).getByRole('button', { name: 'Allocate' }));
        expect(within(allocateItemsModal).getByText(localeContext.language.translate('shipping.quantity_max_error'))).toBeInTheDocument();

        await userEvent.clear(physicalItemQuantityInput);
        await userEvent.type(physicalItemQuantityInput, '1');
        expect(physicalItemQuantityInput).toHaveValue(1);

        const customItemQuantityInput = within(allocateItemsModal).getByLabelText('Quantity of Custom item');

        expect(customItemQuantityInput).toBeInTheDocument();
        expect(customItemQuantityInput).toHaveValue(0);

        await userEvent.type(customItemQuantityInput, '5');

        expect(customItemQuantityInput).toHaveValue(5);

        await userEvent.click(within(allocateItemsModal).getByRole('button', { name: 'Allocate' }));
        expect(within(allocateItemsModal).getByText(localeContext.language.translate('shipping.custom_item_quantity_error'))).toBeInTheDocument();

        await userEvent.clear(customItemQuantityInput);
        await userEvent.type(customItemQuantityInput, `${getCustomItem().quantity}`);
        expect(customItemQuantityInput).toHaveValue(getCustomItem().quantity);

        await userEvent.click(within(allocateItemsModal).getByRole('button', { name: 'Allocate' }));

        await waitFor(() => {
            expect(allocateItemsModal).not.toBeInTheDocument();
        });
    });

    it('displays 1 item left to allocate banner', async () => {
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
            ...getCheckout(),
            consignments: [{
                ...getConsignment(),
                lineItemIds: [
                    getPhysicalItem().id.toString(),
                ]
            }],
            cart: {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [{
                        ...getPhysicalItem(),
                        quantity: 2,
                    },
                    {
                        ...getPhysicalItem(),
                        id: '2',
                        quantity: 1,
                    }],
                },
            },
        });

        const address = getShippingAddress();

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider checkoutService={checkoutService}>
                        <MultiShippingFormV2 {...defaultProps} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.getByText('Destination #1')).toBeInTheDocument();
        expect(screen.getByText(getAddressContent(address))).toBeInTheDocument();

        expect(screen.getByText('1 item left to allocate')).toBeInTheDocument();
    });

    it('displays all items are allocated banner', async () => {
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
            ...getCheckout(),
            consignments: [{
                ...getConsignment(),
                lineItemIds: [
                    getPhysicalItem().id.toString(),
                    '2',
                ]
            }],
            cart: {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [{
                        ...getPhysicalItem(),
                        quantity: 2,
                    },
                    {
                        ...getPhysicalItem(),
                        id: '2',
                        quantity: 1,
                    }],
                },
            },
        });

        const address = getShippingAddress();

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider checkoutService={checkoutService}>
                        <MultiShippingFormV2 {...defaultProps} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.getByText('Destination #1')).toBeInTheDocument();
        expect(screen.getByText(getAddressContent(address))).toBeInTheDocument();

        expect(screen.getByText('All items are allocated.')).toBeInTheDocument();
    });
});
