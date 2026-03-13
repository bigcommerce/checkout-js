import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { memo, type ReactNode } from 'react';

import { useCapabilities } from '@bigcommerce/checkout/contexts';
import { PoweredByPayPalFastlaneLabel, usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import { DropdownTrigger } from '../ui/dropdown';

import AddressSelectButton from './AddressSelectButton';
import { AddressSelectComponent } from './AddressSelectComponent';
import type AddressType from './AddressType';
import isEqualAddress from './isEqualAddress';
import { SearchableAddressSelectComponent } from './SearchableAddressSelectComponent';

import './AddressSelect.scss';

export interface AddressSelectProps {
    addresses: CustomerAddress[];
    selectedAddress?: Address;
    type: AddressType;
    showSingleLineAddress?: boolean;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
    placeholderText?: ReactNode;
}

const AddressSelect = ({
    addresses,
    selectedAddress,
    type,
    showSingleLineAddress,
    onSelectAddress,
    onUseNewAddress,
    placeholderText,
}: AddressSelectProps) => {
    const { userJourney: { hasCompanyAddressBook } } = useCapabilities();
    const { shouldShowPayPalFastlaneLabel } = usePayPalFastlaneAddress();

    const handleSelectAddress = (newAddress: Address) => {
        if (!isEqualAddress(selectedAddress, newAddress)) {
            onSelectAddress(newAddress);
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

export default memo(AddressSelect);
