import '@testing-library/jest-dom';
import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
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
        const destination1 = screen.getByText('Destination #1').parentElement?.parentElement;

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
                    digitalItems: [],
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

        expect(screen.queryByText(/Please complete the address/i)).not.toBeInTheDocument();

        await userEvent.click(addShippingDestinationButton);

        expect(screen.getByText('Destination #2')).toBeInTheDocument();
        expect(
            screen.getByText(
                localeContext.language.translate(
                    'shipping.multishipping_incomplete_consignment_error',
                    {
                        consignmentNumber: 2,
                    },
                ),
            ),
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('No item allocated')).not.toBeInTheDocument();
        });

        // eslint-disable-next-line testing-library/no-node-access
        const destination2 = screen.getByText('Destination #2').parentElement?.parentElement;
        const addressSelectButton = within(destination2).getByTestId('address-select-button');

        await userEvent.click(addressSelectButton);

        // eslint-disable-next-line testing-library/no-node-access
        const addressOption = screen.getAllByTestId('address-select-option')[0].firstChild;

        expect(addressOption).toBeInTheDocument();

        if (addressOption) {
            await userEvent.click(addressOption);
        }

        expect(screen.getByText('No item allocated')).toBeInTheDocument();

        const allocateItemsButton = screen.getByTestId('allocate-items-button');

        expect(allocateItemsButton).toBeInTheDocument();
        await userEvent.click(allocateItemsButton);

        const allocateItemsModal = screen.getByRole('dialog');

        expect(allocateItemsModal).toBeInTheDocument();

        const allocateItemsModalHeader = within(allocateItemsModal).getByText('Destination #2');

        expect(allocateItemsModalHeader).toBeInTheDocument();

        expect(screen.queryByText(localeContext.language.translate('shipping.multishipping_digital_item_no_shipping_banner'))).not.toBeInTheDocument();

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

    it('displays digital item no shipping banner', async () => {
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider checkoutService={checkoutService}>
                        <MultiShippingFormV2 {...defaultProps} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.getByText('1 item left to allocate')).toBeInTheDocument();

        const addShippingDestinationButton = screen.getByRole('button', { name: 'Add new destination' });

        expect(addShippingDestinationButton).toBeInTheDocument();
        await userEvent.click(addShippingDestinationButton);

        expect(screen.getByText('Destination #2')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('No item allocated')).not.toBeInTheDocument();
        });

        // eslint-disable-next-line testing-library/no-node-access
        const destination2 = screen.getByText('Destination #2').parentElement?.parentElement;
        const addressSelectButton = within(destination2).getByTestId('address-select-button');

        await userEvent.click(addressSelectButton);

        // eslint-disable-next-line testing-library/no-node-access
        const addressOption = screen.getAllByTestId('address-select-option')[0].firstChild;

        expect(addressOption).toBeInTheDocument();

        if (addressOption) {
            await userEvent.click(addressOption);
        }

        expect(screen.getByText('No item allocated')).toBeInTheDocument();

        const allocateItemsButton = screen.getByTestId('allocate-items-button');

        expect(allocateItemsButton).toBeInTheDocument();
        await userEvent.click(allocateItemsButton);

        const allocateItemsModal = screen.getByRole('dialog');

        expect(allocateItemsModal).toBeInTheDocument();

        const allocateItemsModalHeader = within(allocateItemsModal).getByText('Destination #2');

        expect(allocateItemsModalHeader).toBeInTheDocument();

        expect(screen.getByText(localeContext.language.translate('shipping.multishipping_digital_item_no_shipping_banner'))).toBeInTheDocument();
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

        expect(screen.getByText(localeContext.language.translate('shipping.multishipping_all_items_allocated_message'))).toBeInTheDocument();
    });

    it('edits consignment line items', async () => {
        jest.spyOn(checkoutService, 'deleteConsignment').mockResolvedValue({} as CheckoutSelectors);
        jest.spyOn(checkoutService, 'createConsignments').mockResolvedValue({} as CheckoutSelectors);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
            ...getCheckout(),
            consignments: [{
                ...getConsignment(),
                lineItemIds: [
                    getPhysicalItem().id.toString(),
                    "2",
                ]
            }],
            cart: {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [{
                        ...getPhysicalItem(),
                        quantity: 2,
                        sku: 'sku1',
                    },
                    {
                        ...getPhysicalItem(),
                        id: '2',
                        name: 'Product 2',
                        sku: 'sku2',
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
        expect(screen.getByText(localeContext.language.translate('shipping.multishipping_all_items_allocated_message'))).toBeInTheDocument();

        const reAllocateItemsButton = screen.getByTestId('reallocate-items-button');

        expect(reAllocateItemsButton).toBeInTheDocument();
        await userEvent.click(reAllocateItemsButton);

        const reAllocateItemsModal = screen.getByRole('dialog');

        expect(reAllocateItemsModal).toBeInTheDocument();
        expect(within(reAllocateItemsModal).getByText('Canvas Laundry Cart')).toBeInTheDocument();

        expect(within(reAllocateItemsModal).queryByTestId('split-item-tooltip')).not.toBeInTheDocument();

        const removeItemButton = within(reAllocateItemsModal).getByTestId(`remove-${getPhysicalItem().id.toString()}-button`);

        expect(removeItemButton).toBeInTheDocument();

        await userEvent.click(removeItemButton);

        expect(checkoutService.createConsignments).toHaveBeenCalled();
        expect(checkoutService.deleteConsignment).not.toHaveBeenCalled();
    });

    it('deletes consignment when deleting last consignment line item', async () => {
        jest.spyOn(checkoutService, 'deleteConsignment').mockResolvedValue({} as CheckoutSelectors);

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
                        name: 'Product 2',
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

        const reAllocateItemsButton = screen.getByTestId('reallocate-items-button');

        expect(reAllocateItemsButton).toBeInTheDocument();
        await userEvent.click(reAllocateItemsButton);

        const reAllocateItemsModal = screen.getByRole('dialog');

        expect(reAllocateItemsModal).toBeInTheDocument();
        expect(within(reAllocateItemsModal).getByText('Canvas Laundry Cart')).toBeInTheDocument();

        const removeItemButton = within(reAllocateItemsModal).getByTestId(`remove-${getPhysicalItem().id.toString()}-button`);

        expect(removeItemButton).toBeInTheDocument();

        await userEvent.click(removeItemButton);

        expect(checkoutService.deleteConsignment).toHaveBeenCalled();
    });

    it('removes a consignment', async () => {
        jest.spyOn(checkoutService, 'deleteConsignment').mockReturnValue(
            Promise.resolve(checkoutService.getState()),
        );

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

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider checkoutService={checkoutService}>
                        <MultiShippingFormV2 {...defaultProps} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.queryByTestId('split-item-tooltip')).not.toBeInTheDocument();

        const closeButton = screen.getByTestId('delete-consignment-button');

        expect(closeButton).toBeInTheDocument();

        await userEvent.click(closeButton);

        expect(checkoutService.deleteConsignment).toHaveBeenCalledWith(getConsignment().id);
    });

    it('displays split item tooltip', async () => {
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
            ...getCheckout(),
            consignments: [{
                ...getConsignment(),
                lineItemIds: [
                    '1',
                    '2',
                ]
            }],
            cart: {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [
                        {
                            ...getPhysicalItem(),
                            id: '1',
                        },
                        {
                            ...getPhysicalItem(),
                            id: '2',
                        },
                        {
                            ...getPhysicalItem(),
                            id: '3',
                        },
                        {
                            ...getPhysicalItem(),
                            id: '4',
                        },
                    ],
                },
            },
        });

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider checkoutService={checkoutService}>
                        <MultiShippingFormV2 {...defaultProps} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.getByTestId('split-item-tooltip')).toBeInTheDocument();

        await userEvent.click(screen.getByTestId('reallocate-items-button'));

        const reAllocateItemsModal = screen.getByRole('dialog');

        expect(reAllocateItemsModal).toBeInTheDocument();
        expect(within(reAllocateItemsModal).getAllByTestId('split-item-tooltip')).toHaveLength(2);
    });
});
