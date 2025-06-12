import { Address } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import React from "react";

import { useStyleContext } from '@bigcommerce/checkout/payment-integration-api';

import AddressType from "./AddressType";

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

const SingleLineStaticAddress = ({ address }: SingleLineStaticAddressProps) => {
    const { newFontStyle } = useStyleContext();

    const isValid = !isEmpty(address);

    return !isValid ? null : (
        <div className="vcard checkout-address--static" data-test="static-address">
            <p className={classNames('address-entry', { 'body-regular': newFontStyle })}>
                {getAddressContent(address)}
            </p>
        </div>
    );
}

export default SingleLineStaticAddress;
