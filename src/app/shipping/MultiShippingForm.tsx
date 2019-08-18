import { Address, Cart, CheckoutSelectors, CheckoutStoreSelector, Consignment, ConsignmentAssignmentRequestBody, CustomerAddress, FormField } from '@bigcommerce/checkout-sdk';
import { withFormik, FormikProps } from 'formik';
import React, { Component, ReactNode } from 'react';

import { isValidAddress } from '../address';
import { preventDefault } from '../common/dom';
import { withLanguage, TranslatedHtml, TranslatedString, WithLanguageProps } from '../locale';
import { Form } from '../ui/form';

import { AssignItemFailedError, AssignItemInvalidAddressError } from './errors';
import getShippableItemsCount from './getShippableItemsCount';
import getShippableLineItems from './getShippableLineItems';
import hasSelectedShippingOptions from './hasSelectedShippingOptions';
import hasUnassignedLineItems from './hasUnassignedLineItems';
import updateShippableItems from './updateShippableItems';
import ItemAddressSelect from './ItemAddressSelect';
import ShippableItem from './ShippableItem';
import ShippingFormFooter from './ShippingFormFooter';

export interface MultiShippingFormProps {
    addresses: CustomerAddress[];
    cart: Cart;
    cartHasChanged: boolean;
    consignments: Consignment[];
    createAccountUrl: string;
    customerMessage: string;
    isGuest: boolean;
    isLoading: boolean;
    shouldShowOrderComments: boolean;
    assignItem(consignment: ConsignmentAssignmentRequestBody): Promise<CheckoutSelectors>;
    onSignIn(): void;
    getFields(countryCode?: string): FormField[];
    onSubmit(values: MultiShippingFormValues): void;
    onUnhandledError(error: Error): void;
    onUseNewAddress(address: Address, itemId: string): void;
}

export interface MultiShippingFormState {
    items: ShippableItem[];
}

class MultiShippingForm extends Component<MultiShippingFormProps & WithLanguageProps & FormikProps<MultiShippingFormValues>, MultiShippingFormState> {
    static getDerivedStateFromProps(
        { cart, consignments }: MultiShippingFormProps,
        state: MultiShippingFormState
    ) {
        if (!state || !state.items || getShippableItemsCount(cart) !== state.items.length) {
            return { items: getShippableLineItems(cart, consignments) };
        }

        return null;
    }

    state: MultiShippingFormState = { items: [] };

    render(): ReactNode {
        const {
            addresses,
            consignments,
            cart,
            isGuest,
            onUseNewAddress,
            onSignIn,
            createAccountUrl,
            cartHasChanged,
            shouldShowOrderComments,
            isLoading,
        } = this.props;

        const { items } = this.state;

        if (isGuest) {
            return (
                <div className="checkout-step-info">
                    <TranslatedString id="shipping.multishipping_guest_intro" />
                    { ' ' }
                    <a href="#" onClick={ preventDefault(onSignIn) } data-test="shipping-sign-in-link">
                        <TranslatedString id="shipping.multishipping_guest_sign_in" />
                    </a>
                    { ' ' }
                    <TranslatedHtml
                        id="shipping.multishipping_guest_create"
                        data={ { url: createAccountUrl } }
                    />
                </div>
            );
        }

        return (
            <Form>
                <ul className="consignmentList">
                    { items.map(item => (
                        <li key={ item.key }>
                            <ItemAddressSelect
                                item={ item }
                                addresses={ addresses }
                                onSelectAddress={ (address, itemId) => this.handleSelectAddress(address, itemId, item.key)}
                                onUseNewAddress={ onUseNewAddress }
                            />
                        </li>
                    ))}
                </ul>

                <ShippingFormFooter
                    isMultiShippingMode={ true }
                    cartHasChanged={ cartHasChanged }
                    shouldShowOrderComments={ shouldShowOrderComments }
                    shouldShowShippingOptions={ !hasUnassignedLineItems(consignments, cart.lineItems) }
                    shouldDisableSubmit={ this.shouldDisableSubmit() }
                    isLoading={ isLoading }
                />
            </Form>
        );
    }

    private handleSelectAddress: (address: Address, itemId: string, itemKey: string) => Promise<void> = async (address, itemId, itemKey) => {
        const {
            assignItem,
            onUnhandledError,
            getFields,
        } = this.props;

        if (!isValidAddress(address, getFields(address.countryCode))) {
            return onUnhandledError(new AssignItemInvalidAddressError());
        }

        try {
            const { data } = await assignItem({
                shippingAddress: address,
                lineItems: [{
                    itemId,
                    quantity: 1,
                }],
            });

            this.syncItems(itemKey, address, data);
        } catch (e) {
            onUnhandledError(new AssignItemFailedError(e));
        }
    };

    private shouldDisableSubmit: () => boolean = () => {
        const { isLoading, consignments } = this.props;

        return isLoading || !hasSelectedShippingOptions(consignments);
    };

    private syncItems: (
        key: string,
        address: Address,
        data: CheckoutStoreSelector
    ) => void = (key, address, data) => {
        const items = updateShippableItems(
            this.state.items,
            {
                updatedItemIndex: this.state.items.findIndex(item => item.key === key),
                address,
            },
            {
                cart: data.getCart(),
                consignments: data.getConsignments(),
            }
        );

        if (items) {
            this.setState({ items });
        }
    };
}

export interface MultiShippingFormValues {
    orderComment: string;
}

export default withLanguage(withFormik<MultiShippingFormProps & WithLanguageProps, MultiShippingFormValues>({
    handleSubmit: (values, { props: { onSubmit } }) => {
        onSubmit(values);
    },
    mapPropsToValues: ({ customerMessage }) => ({
        orderComment: customerMessage,
    }),
    enableReinitialize: true,
})(MultiShippingForm));
