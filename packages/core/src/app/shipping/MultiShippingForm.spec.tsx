import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { AddressFormModal } from '../address';
import { getAddressFormFields } from '../address/formField.mock';
import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import { getConsignment } from './consignment.mock';
import ItemAddressSelect from './ItemAddressSelect';
import MultiShippingForm, { MultiShippingFormProps } from './MultiShippingForm';

describe('MultiShippingForm Component', () => {
    const checkoutService = createCheckoutService();

    let component: ReactWrapper;
    let localeContext: LocaleContextType;
    let defaultProps: MultiShippingFormProps;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());

        defaultProps = {
            cart: {
                ...getCart(),
                lineItems: {
                    physicalItems: [{ ...getPhysicalItem(), quantity: 3 }],
                    giftCertificates: [],
                    digitalItems: [],
                },
            },
            getFields: jest.fn(() => getAddressFormFields()),
            isGuest: false,
            onCreateAccount: jest.fn(),
            onSignIn: jest.fn(),
            addresses: getCustomer().addresses,
            shouldShowOrderComments: true,
            cartHasChanged: false,
            customerMessage: 'x',
            countriesWithAutocomplete: [],
            isLoading: false,
            consignments: [
                { ...getConsignment(), id: 'foo' },
                { ...getConsignment(), id: 'bar' },
            ],
            onSubmit: jest.fn(),
            assignItem: jest.fn(),
            createCustomerAddress: jest.fn(),
            shouldShowAddAddressInCheckout: true,
            onUnhandledError: jest.fn(),
            onUseNewAddress: jest.fn(),
        };
    });

    describe('when user is guest', () => {
        beforeEach(() => {
            component = mount(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <MultiShippingForm {...defaultProps} isGuest={true} />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );
        });

        it('renders sign in message', () => {
            component.find('[data-test="shipping-sign-in-link"]').simulate('click');

            expect(defaultProps.onSignIn).toHaveBeenCalled();
        });
    });

    describe('when user is signed in', () => {
        beforeEach(() => {
            component = mount(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <MultiShippingForm {...defaultProps} />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );
        });

        it('renders shippable items list', () => {
            expect(component.find('.consignmentList > li')).toHaveLength(3);

            expect(component.find(ItemAddressSelect).at(0).props()).toEqual(
                expect.objectContaining({
                    addresses: defaultProps.addresses,
                }),
            );
        });

        it('renders address form modal when shoppers choose new address', async () => {
            component.find(ItemAddressSelect).first().find('#addressToggle').simulate('click');

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            component.find('[data-test="add-new-address"]').simulate('click');

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(AddressFormModal).prop('isOpen')).toBeTruthy();
        });
    });
});
