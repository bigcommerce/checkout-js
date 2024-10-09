import { Address } from '@bigcommerce/checkout-sdk';
import { isEmpty } from 'lodash';
import React from "react";

import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

import AddressType from "./AddressType";
import isValidAddress from "./isValidAddress";

export interface StaticAddressV2Props {
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

const SingleLineStaticAddress = ({ address, type }: StaticAddressV2Props) => {
    const {
        checkoutState: {
            data: { getBillingAddressFields, getShippingAddressFields },
        }
    } = useCheckout();

    const fields =
        type === AddressType.Billing
            ? getBillingAddressFields(address.countryCode)
            : type === AddressType.Shipping
                ? getShippingAddressFields(address.countryCode)
                : undefined;

    const isValid = !fields
        ? !isEmpty(address)
        : isValidAddress(
            address,
            fields.filter((field) => !field.custom),
        );

    return !isValid ? null : (
        <div className="vcard checkout-address--static" data-test="static-address">
            <p className="address-entry">
                {getAddressContent(address)}
            </p>
        </div>
    );
}

export default SingleLineStaticAddress;
