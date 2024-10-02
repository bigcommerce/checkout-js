import { Address } from '@bigcommerce/checkout-sdk';

import React, { FunctionComponent, useMemo, useState } from 'react';
import styled from 'styled-components';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedLink, TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { AddressFormModal, AddressFormValues, AddressSelect, AddressType, isValidAddress, mapAddressFromFormValues } from '../address';
import { ErrorModal } from '../common/error';
import { withFormikExtended } from '../common/form';
import { EMPTY_ARRAY, isFloatingLabelEnabled } from '../common/utility';
import { Button, ButtonVariant } from '../ui/button';
import { Form } from '../ui/form';

import { AssignItemFailedError, AssignItemInvalidAddressError } from './errors';
import hasSelectedShippingOptions from './hasSelectedShippingOptions';
import MultiShippingFormV2Footer from './MultiShippingFormV2Footer';

const StyledConsignment = styled.div`
    border: 1px solid #D0D0D0;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
`;

const StyledConsignmentHeader = styled.h3`
    font-size: 1.25rem;
    margin: 0 0 1rem;
`;

const StyledButton = styled(Button)`
    color: #5f5f5f;
`;

interface MultiShippingFormV2Values {
    orderComment: string;
}

export interface MultiShippingFormV2Props {
    customerMessage: string;
    defaultCountryCode?: string;
    countriesWithAutocomplete: string[];
    isLoading: boolean;
    onCreateAccount(): void;
    onSignIn(): void;
    onUnhandledError(error: Error): void;
    onSubmit(values: MultiShippingFormV2Values): void;
}

const MultiShippingFormV2: FunctionComponent<MultiShippingFormV2Props> = ({
    countriesWithAutocomplete,
    defaultCountryCode,
    isLoading,
    onCreateAccount,
    onSignIn,
    onUnhandledError,
}: MultiShippingFormV2Props) => {
    const [isOpenNewAddressModal, setIsOpenNewAddressModal] = useState(false);
    const [addShippingDestination, setAddShippingDestination] = useState(false);
    const [newConsignmentAddress, setNewConsignmentAddress] = useState<Address>();
    const [consignmentLineItems, setConsignmentLineItems] = useState<string[]>([]);
    const [createCustomerAddressError, setCreateCustomerAddressError] = useState<Error>();

    const {
        checkoutState: {
            data: { getCart, getConsignments, getShippingCountries, getCustomer, getConfig, getShippingAddressFields: getFields },
        },
        checkoutService: { assignItemsToAddress: assignItem, createCustomerAddress },
    } = useCheckout();

    const cart = getCart();
    const consignments = getConsignments() || EMPTY_ARRAY;
    const countries = getShippingCountries() || EMPTY_ARRAY;
    const customer = getCustomer();
    const config = getConfig();

    const shouldDisableSubmit = useMemo(() => {
        return isLoading || !hasSelectedShippingOptions(consignments);
    }, [isLoading, consignments]);

    if (!cart || !config || !customer) {
        return null;
    }

    const isFloatingLabelEnabledFlag = isFloatingLabelEnabled(config.checkoutSettings);
    const addresses = customer.addresses || EMPTY_ARRAY;
    const isGuest = customer.isGuest;
    const {
        checkoutSettings: {
            enableOrderComments: shouldShowOrderComments,
            googleMapsApiKey,
        },
    } = config;

    const handleSelectAddress = async (address: Address, lineItemIds: string[]) => {
        if (addShippingDestination) {
            setNewConsignmentAddress(address);
        }

        if (!isValidAddress(address, getFields(address.countryCode))) {
            return onUnhandledError(new AssignItemInvalidAddressError());
        }

        try {
            await assignItem({
                address,
                // TODO: CHECKOUT-8596: Update quantity based on line item quantity
                lineItems: lineItemIds.map((lineItemId) => ({ itemId: lineItemId, quantity: 1 })),
            });

        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(new AssignItemFailedError(error));
            }
        }
    }

    const handleUseNewAddress = (lineItemIds: string[] = []) => {
        setConsignmentLineItems(lineItemIds);
        setIsOpenNewAddressModal(true);
    }

    const handleCloseAddAddressForm = () => {
        setIsOpenNewAddressModal(false);
    }

    const handleSaveAddress = async (addressFormValues: AddressFormValues) => {
        const address = mapAddressFromFormValues(addressFormValues);

        if (addShippingDestination) {
            setNewConsignmentAddress(address);
        }

        await handleSelectAddress(
            address,
            consignmentLineItems
        );

        try {
            await createCustomerAddress(address);
        } catch (error) {
            if (error instanceof Error) {
                setCreateCustomerAddressError(error);
            }
        }

        setIsOpenNewAddressModal(false);
    }

    const handleAddShippingDestination = () => {
        setAddShippingDestination(true);
    }

    const handleCloseErrorModal = () => {
        setCreateCustomerAddressError(undefined);
    }

    if (isGuest) {
        return (
            <div className="checkout-step-info">
                <TranslatedString id="shipping.multishipping_guest_intro" />{' '}
                <a
                    data-test="shipping-sign-in-link"
                    href="#"
                    onClick={preventDefault(onSignIn)}
                >
                    <TranslatedString id="shipping.multishipping_guest_sign_in" />
                </a>{' '}
                <TranslatedLink
                    id="shipping.multishipping_guest_create"
                    onClick={onCreateAccount}
                />
            </div>
        );
    }

    return <>
        <div>
            <ErrorModal
                error={createCustomerAddressError}
                message={
                    <>
                        <TranslatedString id="address.consignment_address_updated_text" />{' '}
                        <TranslatedString id="customer.create_address_error" />
                    </>
                }
                onClose={handleCloseErrorModal}
                shouldShowErrorCode={false}
            />
            <AddressFormModal
                countries={countries}
                countriesWithAutocomplete={countriesWithAutocomplete}
                defaultCountryCode={defaultCountryCode}
                getFields={getFields}
                googleMapsApiKey={googleMapsApiKey}
                isFloatingLabelEnabled={isFloatingLabelEnabledFlag}
                isLoading={isLoading}
                isOpen={isOpenNewAddressModal}
                onRequestClose={handleCloseAddAddressForm}
                onSaveAddress={handleSaveAddress}
            />
            {consignments.map((consignment, index) => (
                <StyledConsignment key={consignment.id}>
                    <StyledConsignmentHeader>Shipping destination {index + 1}</StyledConsignmentHeader>
                    <AddressSelect
                        addresses={addresses}
                        onSelectAddress={(address) => handleSelectAddress(address, consignment.lineItemIds)}
                        onUseNewAddress={() => handleUseNewAddress(consignment.lineItemIds)}
                        selectedAddress={consignment.shippingAddress}
                        showSingleLineAddress
                        type={AddressType.Shipping}
                    />
                </StyledConsignment>
            ))
            }
            {(consignments.length === 0 || addShippingDestination) &&
                (<StyledConsignment>
                    <StyledConsignmentHeader>Shipping destination {consignments.length === 0 ? 1 : (consignments.length + 1)}</StyledConsignmentHeader>
                    <AddressSelect
                        addresses={addresses}
                        onSelectAddress={(address) => handleSelectAddress(address, [])}
                        onUseNewAddress={() => handleUseNewAddress([])}
                        selectedAddress={newConsignmentAddress ?? undefined}
                        showSingleLineAddress
                        type={AddressType.Shipping}
                    />
                </StyledConsignment>
                )
            }
        </div>
        <StyledButton onClick={handleAddShippingDestination} variant={ButtonVariant.Secondary}>
            Add shipping destination
        </StyledButton>
        <Form>
            <MultiShippingFormV2Footer
                isLoading={isLoading}
                shouldDisableSubmit={shouldDisableSubmit}
                shouldShowOrderComments={shouldShowOrderComments}
            />
        </Form>
    </>
}

export default withLanguage(
    withFormikExtended<MultiShippingFormV2Props & WithLanguageProps, MultiShippingFormV2Values>({
        handleSubmit: (values, { props: { onSubmit } }) => {
            onSubmit(values);
        },
        mapPropsToValues: ({ customerMessage }) => ({
            orderComment: customerMessage,
        }),
        enableReinitialize: true,
    })(MultiShippingFormV2),
);
