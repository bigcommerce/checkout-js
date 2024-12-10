import { Address } from '@bigcommerce/checkout-sdk';
import React from "react";

import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

import { isExperimentEnabled } from '../common/utility';

import AddressType from "./AddressType";
import isValidStaticAddress from './isValidStaticAddress';

export interface SingleLineStaticAddressProps {
    address: Address;
    type?: AddressType;
}

export const getAddressContent: (value: Address) => string = ({
    firstName,
    lastName,
    address1,
    address2,
    city,
    countryCode,
    stateOrProvince,
    postalCode,
}: Address): string => {
    const addressParts = [address1, address2, city, stateOrProvince, countryCode, postalCode];
    const nonEmptyAddressParts = addressParts.filter(Boolean);
    const address = nonEmptyAddressParts.join(', ');

    if (!firstName || !lastName || !address) {
        return '';
    }

    return `${firstName} ${lastName}, ${address}`;
};

const SingleLineStaticAddress = ({ address, type }: SingleLineStaticAddressProps) => {
    const {
        checkoutState: {
            data: { getConfig, getBillingAddressFields, getShippingAddressFields },
        }
    } = useCheckout();

    const config = getConfig();
    const validateAddressFields =
        isExperimentEnabled(
            config?.checkoutSettings,
            'CHECKOUT-7560.address_fields_max_length_validation',
        );

    const fields =
        type === AddressType.Billing
            ? getBillingAddressFields(address.countryCode)
            : type === AddressType.Shipping
                ? getShippingAddressFields(address.countryCode)
                : undefined;

    const isValid = isValidStaticAddress(address, validateAddressFields, fields);

    return !isValid ? null : (
        <div className="vcard checkout-address--static" data-test="static-address">
            <p className="address-entry">
                {getAddressContent(address)}
            </p>
        </div>
    );
}

export default SingleLineStaticAddress;
