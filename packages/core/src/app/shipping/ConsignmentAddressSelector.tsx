import { Address, ConsignmentCreateRequestBody } from "@bigcommerce/checkout-sdk";
import React, { useState } from "react";

import { TranslatedString } from "@bigcommerce/checkout/locale";
import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

import { AddressFormModal, AddressFormValues, AddressSelect, AddressType, isValidAddress, mapAddressFromFormValues } from "../address";
import { ErrorModal } from "../common/error";
import { EMPTY_ARRAY, isFloatingLabelEnabled } from "../common/utility";

import { AssignItemFailedError, AssignItemInvalidAddressError } from "./errors";
import { MultiShippingConsignmentData } from "./MultishippingV2Type";

interface ConsignmentAddressSelectorProps {
    consignment?: MultiShippingConsignmentData;
    defaultCountryCode?: string;
    countriesWithAutocomplete: string[];
    isLoading: boolean;
    onUnhandledError(error: Error): void;
    setConsignmentRequest?(consignmentRequest: ConsignmentCreateRequestBody): void;
    selectedAddress?: Address;
}

const ConsignmentAddressSelector = ({
    consignment,
    countriesWithAutocomplete,
    defaultCountryCode,
    isLoading,
    onUnhandledError,
    selectedAddress,
    setConsignmentRequest,
}: ConsignmentAddressSelectorProps) => {
    const [isOpenNewAddressModal, setIsOpenNewAddressModal] = useState(false);
    const [createCustomerAddressError, setCreateCustomerAddressError] = useState<Error>();

    const {
        checkoutState: {
            data: { getShippingCountries, getCustomer, getConfig, getShippingAddressFields: getFields },
        },
        checkoutService: { assignItemsToAddress: assignItem, createCustomerAddress },
    } = useCheckout();

    const countries = getShippingCountries() || EMPTY_ARRAY;
    const customer = getCustomer();
    const config = getConfig();

    if (!config || !customer) {
        return null;
    }

    const isFloatingLabelEnabledFlag = isFloatingLabelEnabled(config.checkoutSettings);
    // TODO: add filter for addresses 
    const addresses = customer.addresses || EMPTY_ARRAY;
    const {
        checkoutSettings: {
            googleMapsApiKey,
        },
    } = config;

    const handleSelectAddress = async (address: Address) => {
        if (!isValidAddress(address, getFields(address.countryCode))) {
            return onUnhandledError(new AssignItemInvalidAddressError());
        }

        if (!consignment) {
            setConsignmentRequest?.({
                address,
                shippingAddress: address,
                lineItems: [],
            });

            return;
        }

        try {
            await assignItem({
                address,
                lineItems: consignment.lineItems.map(({ id, quantity }) => ({ itemId: id, quantity })),
            });

        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(new AssignItemFailedError(error));
            }
        }
    }

    const handleUseNewAddress = () => {
        setIsOpenNewAddressModal(true);
    }

    const handleCloseAddAddressForm = () => {
        setIsOpenNewAddressModal(false);
    }

    const handleSaveAddress = async (addressFormValues: AddressFormValues) => {
        const address = mapAddressFromFormValues(addressFormValues);

        if (!isValidAddress(address, getFields(address.countryCode))) {
            return onUnhandledError(new AssignItemInvalidAddressError());
        }

        await handleSelectAddress(address);

        try {
            await createCustomerAddress(address);
        } catch (error) {
            if (error instanceof Error) {
                setCreateCustomerAddressError(error);
            }
        }

        setIsOpenNewAddressModal(false);
    }

    const handleCloseErrorModal = () => {
        setCreateCustomerAddressError(undefined);
    }

    return (
        <>
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
            <AddressSelect
                addresses={addresses}
                onSelectAddress={handleSelectAddress}
                onUseNewAddress={handleUseNewAddress}
                selectedAddress={selectedAddress}
                showSingleLineAddress
                type={AddressType.Shipping}
            />
        </>
    )
}

export default ConsignmentAddressSelector;
