import { type Address, type ConsignmentCreateRequestBody } from "@bigcommerce/checkout-sdk";
import React, { useState } from "react";

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from "@bigcommerce/checkout/locale";

import { AddressFormModal, type AddressFormValues, AddressSelect, AddressType, isValidAddress, mapAddressFromFormValues } from "../address";
import { ErrorModal } from "../common/error";
import { EMPTY_ARRAY, isExperimentEnabled } from "../common/utility";

import { AssignItemFailedError, AssignItemInvalidAddressError } from "./errors";
import GuestCustomerAddressSelector from "./GuestCustomerAddressSelector";
import { type MultiShippingConsignmentData } from "./MultishippingType";
import { setRecommendedOrMissingShippingOption } from './utils';

interface ConsignmentAddressSelectorProps {
    consignment?: MultiShippingConsignmentData;
    defaultCountryCode?: string;
    isLoading: boolean;
    onUnhandledError(error: Error): void;
    setConsignmentRequest?(consignmentRequest: ConsignmentCreateRequestBody): void;
    selectedAddress?: Address;
}

const ConsignmentAddressSelector = ({
    consignment,
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

    const customer = getCustomer();
    const config = getConfig();

    if (!config || !customer) {
        return null;
    }

    // TODO: add filter for addresses
    const addresses = customer.addresses || EMPTY_ARRAY;

    const isGuest = customer.isGuest;

    const validateMaxLength =
        isExperimentEnabled(
            config?.checkoutSettings,
            'CHECKOUT-9768.form_fields_max_length_validation',
            false
        );

    const handleSelectAddress = async (address: Address) => {
        if (!isValidAddress(address, getFields(address.countryCode), validateMaxLength)) {
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
                defaultCountryCode={defaultCountryCode}
                getFields={getFields}
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
