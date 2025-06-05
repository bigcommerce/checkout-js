import { Address } from '@bigcommerce/checkout-sdk';
import { isEmpty } from 'lodash';
import React from "react";

import AddressType from "./AddressType";
import { useStyleContext } from '../checkout/useStyleContext';
import classNames from 'classnames';

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
        <div
            className={classNames('vcard checkout-address--static', { 'body-regular': newFontStyle })}
            data-test="static-address"
        >
            <span className="address-entry">
                {getAddressContent(address)}
            </span>
        </div>
    );
}

export default SingleLineStaticAddress;
