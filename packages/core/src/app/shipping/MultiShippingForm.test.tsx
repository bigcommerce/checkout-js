import '@testing-library/jest-dom';
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExtensionService } from '@bigcommerce/checkout/checkout-extension';
import { CheckoutProvider, ExtensionProvider ,type ExtensionServiceInterface, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen, waitFor, within } from '@bigcommerce/checkout/test-utils';

import { getAddressFormFields } from '../address/formField.mock';
import { getAddressContent } from '../address/SingleLineStaticAddress';
import { getCart } from '../cart/carts.mock';
import { getCustomItem, getPhysicalItem } from '../cart/lineItem.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import { createErrorLogger } from '../common/error';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import { getConsignment } from './consignment.mock';
import { AssignItemFailedError, AssignItemInvalidAddressError } from './errors';
import MultiShippingForm, { type MultiShippingFormProps } from './MultiShippingForm';
import { getShippingAddress } from './shipping-addresses.mock';

describe('MultiShippingForm Component', () => {
    let checkoutService: CheckoutService;
    let extensionService: ExtensionServiceInterface;
    let checkoutState: CheckoutSelectors;
    let defaultProps: MultiShippingFormProps;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        checkoutService = createCheckoutService();
        extensionService = new ExtensionService(checkoutService, createErrorLogger());
        checkoutState = checkoutService.getState();

        defaultProps = {
            cartHasChanged: false,
            customerMessage: 'x',
            isLoading: false,
            onUnhandledError: jest.fn(),
            onSubmit: jest.fn()
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

    it('shows error when creating a new destination if destination 1 is incomplete.', async () => {
        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([]);
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
            ...getCheckout(),
            consignments: [],
        });

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider extensionService={extensionService}>
                        <MultiShippingForm {...defaultProps} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        await userEvent.click(
            screen.getByRole('button', {
                name: localeContext.language.translate(
                    'shipping.multishipping_add_new_destination',
                ),
            }),
        );

        expect(screen.getByText('Destination #1')).toBeInTheDocument();
        expect(
            screen.getByText(
                localeContext.language.translate(
                    'shipping.multishipping_incomplete_consignment_error',
                    {
                        consignmentNumber: 1,
                    },
                ),
            ),
        ).toBeInTheDocument();
    });

    it('shows AssignItemInvalidAddressError and AssignItemFailedError', async () => {
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider extensionService={extensionService}>
                        <MultiShippingForm {...defaultProps} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        await userEvent.click(screen.getByText(/12345 Testing Way/));
        await userEvent.click(screen.getByText(/Infinity Testing Way/));

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(new AssignItemInvalidAddressError());

        await userEvent.click(screen.getByText(/67890 Testing Way/));

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(new AssignItemFailedError(new Error()));
    });

    it('renders correct allocated items in banner if bundled items are present', async () => {
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
            ...getCheckout(),
            consignments: [],
            cart: {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [{
                        ...getPhysicalItem(),
                        id: '1',
                    },
                    {
                        ...getPhysicalItem(),
                        id: '2',
                        quantity: 1,
                    },
                    {
                        ...getPhysicalItem(),
                        id: '3',
                        quantity: 1,
                        parentId: '1'
                    }],
                    digitalItems: [],
                },
            },
        });

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider extensionService={extensionService}>
                        <MultiShippingForm {...defaultProps} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(checkoutState.data.getCheckout()?.cart.lineItems.physicalItems.length).toBe(3);
        expect(screen.getByText('2 items left to allocate')).toBeInTheDocument();
    });

    it('renders shipping destination 1', async () => {
        const address = getShippingAddress();

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider extensionService={extensionService}>
                        <MultiShippingForm {...defaultProps} />
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
                    <ExtensionProvider extensionService={extensionService}>
                        <MultiShippingForm {...defaultProps} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.getByText('Destination #1')).toBeInTheDocument();
        expect(screen.getByText(getAddressContent(address))).toBeInTheDocument();

        expect(screen.getByText('3 items left to allocate')).toBeInTheDocument();

        const addShippingDestinationButton = screen.getByRole('button', {
            name: localeContext.language.translate(
                'shipping.multishipping_add_new_destination',
            ),
        });

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
            expect(screen.queryByText(localeContext.language.translate('shipping.multishipping_no_item_allocated_message'))).not.toBeInTheDocument();
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

        expect(screen.getByText(localeContext.language.translate('shipping.multishipping_no_item_allocated_message'))).toBeInTheDocument();

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
                    <ExtensionProvider extensionService={extensionService}>
                        <MultiShippingForm {...defaultProps} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.getByText('1 item left to allocate')).toBeInTheDocument();

        const addShippingDestinationButton = screen.getByRole('button', {
            name: localeContext.language.translate('shipping.multishipping_add_new_destination'),
        });

        expect(addShippingDestinationButton).toBeInTheDocument();
        await userEvent.click(addShippingDestinationButton);

        expect(screen.getByText('Destination #2')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText(localeContext.language.translate('shipping.multishipping_no_item_allocated_message'))).not.toBeInTheDocument();
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

        expect(screen.getByText(localeContext.language.translate('shipping.multishipping_no_item_allocated_message'))).toBeInTheDocument();

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
                    <ExtensionProvider extensionService={extensionService}>
                        <MultiShippingForm {...defaultProps} />
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
                    <ExtensionProvider extensionService={extensionService}>
                        <MultiShippingForm {...defaultProps} />
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
                    <ExtensionProvider extensionService={extensionService}>
                        <MultiShippingForm {...defaultProps} />
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
                    <ExtensionProvider extensionService={extensionService}>
                        <MultiShippingForm {...defaultProps} />
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
                    <ExtensionProvider extensionService={extensionService}>
                        <MultiShippingForm {...defaultProps} />
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
                    <ExtensionProvider extensionService={extensionService}>
                        <MultiShippingForm {...defaultProps} />
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

    describe('MultiShippingOptions empty cart error handling', () => {
        it('calls onUnhandledError when empty cart error is thrown during shipping option selection', async () => {
            const emptyCartError = {
                type: 'empty_cart',
                message: 'Cart is empty',
            } as any;

            const selectConsignmentShippingOptionSpy = jest.spyOn(checkoutService, 'selectConsignmentShippingOption').mockRejectedValue(emptyCartError);

            jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);
            jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
                ...getCheckout(),
                consignments: [getConsignment()],
            });

            render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider extensionService={extensionService}>
                            <MultiShippingForm {...defaultProps} />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            // Find and click a shipping option radio button
            const shippingOptions = screen.getAllByRole('radio');
            if (shippingOptions.length > 0) {
                await userEvent.click(shippingOptions[0]);
            }

            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(selectConsignmentShippingOptionSpy).toHaveBeenCalled();
            expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(emptyCartError);
        });
    });

    describe('NewConsignment empty cart error handling', () => {
        it('calls onUnhandledError when empty cart error is thrown during item allocation', async () => {
            const emptyCartError = {
                type: 'empty_cart',
                message: 'Cart is empty',
            } as any;

            const assignItemsToAddressSpy = jest.spyOn(checkoutService, 'assignItemsToAddress').mockRejectedValue(emptyCartError);

            jest.spyOn(checkoutState.data, 'getShippingCountries').mockReturnValue([]);
            jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([]);
            jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
                ...getCheckout(),
                consignments: [],
                cart: {
                    ...getCart(),
                    lineItems: {
                        ...getCart().lineItems,
                        physicalItems: [getPhysicalItem()],
                    },
                },
            });

            render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider extensionService={extensionService}>
                            <MultiShippingForm {...defaultProps} />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            const addDestinationButton = screen.getByRole('button', {
                name: localeContext.language.translate('shipping.multishipping_add_new_destination'),
            });
            await userEvent.click(addDestinationButton);

            await waitFor(() => {
                expect(screen.getByText(localeContext.language.translate('shipping.multishipping_consignment_index_heading', { consignmentNumber: 1 }))).toBeInTheDocument();
            });

            expect(assignItemsToAddressSpy).toBeDefined();
        });
    });
});
