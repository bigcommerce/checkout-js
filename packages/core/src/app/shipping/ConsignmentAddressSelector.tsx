import { type Address, type ConsignmentCreateRequestBody } from '@bigcommerce/checkout-sdk';
import React, { useState } from 'react';

import { useCapabilities } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import {
    AddressFormModal,
    type AddressFormValues,
    AddressSelect,
    AddressType,
    isValidAddress,
    mapAddressFromFormValues,
} from '../address';
import { ErrorModal } from '../common/error';
import { EMPTY_ARRAY } from '../common/utility';

import { AssignItemFailedError, AssignItemInvalidAddressError } from './errors';
import GuestCustomerAddressSelector from './GuestCustomerAddressSelector';
import { useShipping } from './hooks/useShipping';
import { type MultiShippingConsignmentData } from './MultishippingType';
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
        userJourney: { hasCompanyAddressBook },
    } = useCapabilities();

    const {
        getFields,
        selectConsignmentShippingOption,
        updateConsignment,
        createCustomerAddress,
        customer,
        validateMaxLength,
        getConsignments: getPreviousConsignments,
    } = useShipping();

    const storageKey = B2BSessionStorage.getConsignmentKey(consignment?.id ?? '');

    // TODO: add filter for addresses
    const addresses = customer.addresses || EMPTY_ARRAY;

    const isGuest = customer.isGuest;

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
                lineItems: consignment.lineItems.map(({ id, quantity }) => ({
                    itemId: id,
                    quantity,
                })),
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
    };

    const handleUseNewAddress = () => {
        setIsOpenNewAddressModal(true);
    };

    const handleCloseAddAddressForm = () => {
        setIsOpenNewAddressModal(false);
    };

    const handleSaveAddress = async (addressFormValues: AddressFormValues) => {
        const address = mapAddressFromFormValues(addressFormValues, storageKey);

        await handleSelectAddress(address);

        // Skip the BC customer address-book save when the B2B company address book is in use
        if (!isGuest && !hasCompanyAddressBook) {
            try {
                await createCustomerAddress(address);
            } catch (error) {
                if (error instanceof Error) {
                    setCreateCustomerAddressError(error);
                }
            }
        }

        setIsOpenNewAddressModal(false);
    };

    const handleCloseErrorModal = () => {
        setCreateCustomerAddressError(undefined);
    };

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
                storageKey={storageKey}
            />
            {isGuest ? (
                <GuestCustomerAddressSelector
                    onUseNewAddress={handleUseNewAddress}
                    selectedAddress={selectedAddress}
                />
            ) : (
                <AddressSelect
                    addresses={addresses}
                    onSelectAddress={handleSelectAddress}
                    onUseNewAddress={handleUseNewAddress}
                    placeholderText={<TranslatedString id="shipping.choose_shipping_address" />}
                    selectedAddress={selectedAddress}
                    showSingleLineAddress
                    type={AddressType.Shipping}
                />
            )}
        </>
    );
};

export default ConsignmentAddressSelector;
