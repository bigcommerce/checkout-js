import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { memo, type ReactNode } from 'react';

import { useCapabilities } from '@bigcommerce/checkout/contexts';
import { PoweredByPayPalFastlaneLabel, usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import { DropdownTrigger } from '../ui/dropdown';

import AddressSelectButton from './AddressSelectButton';
import { AddressSelectComponent } from './AddressSelectComponent';
import type AddressType from './AddressType';
import { B2BExtraFieldsSessionStorage } from './B2BExtraFieldsSessionStorage';
import isEqualAddress from './isEqualAddress';
import { SearchableAddressSelectComponent } from './SearchableAddressSelectComponent';

import './AddressSelect.scss';

export interface AddressSelectProps {
    addresses: CustomerAddress[];
    selectedAddress?: Address;
    type: AddressType;
    showSingleLineAddress?: boolean;
    storageKey?: string;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
    placeholderText?: ReactNode;
}

const AddressSelect = ({
    addresses,
    selectedAddress,
    type,
    showSingleLineAddress,
    storageKey,
    onSelectAddress,
    onUseNewAddress,
    placeholderText,
}: AddressSelectProps) => {
    const { userJourney: { hasCompanyAddressBook } } = useCapabilities();
    const { shouldShowPayPalFastlaneLabel } = usePayPalFastlaneAddress();

    const handleSelectAddress = (newAddress: Address) => {
        const addressWithExtraFields = getAddressWithExtraFields(newAddress, storageKey);

        if (!isEqualAddress(selectedAddress, addressWithExtraFields)) {
            onSelectAddress(addressWithExtraFields);
        }
    };

    const handleUseNewAddress = () => {
        onUseNewAddress(selectedAddress);
    };

    return (
        <div className="form-field">
            <div className="dropdown--select">
                <DropdownTrigger
                    dropdown={hasCompanyAddressBook
                        ? <SearchableAddressSelectComponent
                            addresses={addresses}
                            onSelectAddress={handleSelectAddress}
                            onUseNewAddress={handleUseNewAddress}
                            selectedAddress={selectedAddress}
                            type={type}
                        />
                        : <AddressSelectComponent
                            addresses={addresses}
                            onSelectAddress={handleSelectAddress}
                            onUseNewAddress={handleUseNewAddress}
                            selectedAddress={selectedAddress}
                            type={type}
                        />
                    }
                >
                    <AddressSelectButton
                        addresses={addresses}
                        placeholderText={placeholderText}
                        selectedAddress={selectedAddress}
                        showSingleLineAddress={showSingleLineAddress}
                        type={type}
                    />
                </DropdownTrigger>
            </div>

            {shouldShowPayPalFastlaneLabel && <PoweredByPayPalFastlaneLabel />}
        </div>
    );
}

function getAddressWithExtraFields(address: Address, storageKey?: string): Address {
    if (!storageKey) return address;

    const storedExtraFields = B2BExtraFieldsSessionStorage.getFields(storageKey);

    if (!storedExtraFields) return address;

    return {
        ...address,
        extraFields: Object.entries(storedExtraFields).map(([fieldId, fieldValue]) => ({
            fieldId,
            fieldValue: typeof fieldValue === 'number' ? fieldValue : String(fieldValue),
        })),
    };
}

export default memo(AddressSelect);
