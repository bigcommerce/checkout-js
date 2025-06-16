import { Address, ConsignmentCreateRequestBody } from "@bigcommerce/checkout-sdk";
import React, { useState } from "react";

import { TranslatedString } from "@bigcommerce/checkout/locale";
import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

import { AddressFormModal, AddressFormValues, AddressSelect, AddressType, isValidAddress, mapAddressFromFormValues } from "../address";
import { ErrorModal } from "../common/error";
import { EMPTY_ARRAY, isFloatingLabelEnabled } from "../common/utility";

import { AssignItemFailedError, AssignItemInvalidAddressError } from "./errors";
import GuestCustomerAddressSelector from "./GuestCustomerAddressSelector";
import { MultiShippingConsignmentData } from "./MultishippingType";
import { setRecommendedOrMissingShippingOption } from './utils';

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
            data: {
                getShippingCountries,
                getCustomer,
                getConfig,
                getConsignments: getPreviousConsignments,
                getShippingAddressFields: getFields,
            },
        },
        checkoutService: {
            updateConsignment,
            createCustomerAddress,
            selectConsignmentShippingOption,
        },
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

    const isGuest = customer.isGuest;

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
            const {
                data: { getConsignments },
            } = await updateConsignment({
                id: consignment.id,
                address,
                shippingAddress: address,
                lineItems: consignment.lineItems.map(({ id, quantity }) => ({ itemId: id, quantity })),
            });

            const currentConsignments = getConsignments();

            if (currentConsignments && currentConsignments.length > 0) {
                await setRecommendedOrMissingShippingOption(
                    getPreviousConsignments() ?? [],
                    currentConsignments,
                    selectConsignmentShippingOption,
                );
            }
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

        await handleSelectAddress(address);

        if (!isGuest) {
            try {
                await createCustomerAddress(address);
            } catch (error) {
                if (error instanceof Error) {
                    setCreateCustomerAddressError(error);
                }
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
                selectedAddress={isGuest ? selectedAddress : undefined}
            />
            {isGuest
                ? <GuestCustomerAddressSelector
                    onUseNewAddress={handleUseNewAddress}
                    selectedAddress={selectedAddress}
                />
                : <AddressSelect
                    addresses={addresses}
                    onSelectAddress={handleSelectAddress}
                    onUseNewAddress={handleUseNewAddress}
                    placeholderText={<TranslatedString id="shipping.choose_shipping_address" />}
                    selectedAddress={selectedAddress}
                    showSingleLineAddress
                    type={AddressType.Shipping}
                />
            }
        </>
    )
}

export default ConsignmentAddressSelector;
