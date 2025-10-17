import {
    type Address,
    type CheckoutSelectors,
    type Country,
    type ShippingInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import React, { type FunctionComponent, memo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { localizeAddress } from '@bigcommerce/checkout/locale';
import { type CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../checkout';

import AddressType from './AddressType';

import './StaticAddress.scss';

export interface StaticAddressProps {
    address: Address;
    type?: AddressType;
}

export interface StaticAddressEditableProps extends StaticAddressProps {
    initialize?(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
}

interface WithCheckoutStaticAddressProps {
    countries?: Country[];
}

const StaticAddress: FunctionComponent<
    StaticAddressEditableProps & WithCheckoutStaticAddressProps
    > = ({
        countries,
        address: addressWithoutLocalization,
    }) => {

    const { themeV2 } = useThemeContext();

    const address = localizeAddress(addressWithoutLocalization, countries);
    const isValid = !isEmpty(address);

    return !isValid ? null : (
        <div className="vcard checkout-address--static" data-test="static-address">
            {(address.firstName || address.lastName) && (
                <p className={classNames('fn address-entry',
                    { 'body-regular': themeV2 })}>
                    <span className="first-name">{`${address.firstName} `}</span>
                    <span className="family-name">{address.lastName}</span>
                </p>
            )}

            {(address.phone || address.company) && (
                <p className={classNames('address-entry',
                    { 'body-regular': themeV2 })}>
                    <span className="company-name">{`${address.company} `}</span>
                    <span className="tel">{address.phone}</span>
                </p>
            )}

            <div className="adr">
                <p className={classNames('street-address address-entry',
                    { 'body-regular': themeV2 })}>
                    <span className="address-line-1">{`${address.address1} `}</span>
                    {address.address2 && (
                        <span className="address-line-2">{` / ${address.address2}`}</span>
                    )}
                </p>

                <p className={classNames('address-entry',
                    { 'body-regular': themeV2 })}>
                    {address.city && <span className="locality">{`${address.city}, `}</span>}
                    {address.localizedProvince && (
                        <span className="region">{`${address.localizedProvince}, `}</span>
                    )}
                    {address.postalCode && (
                        <span className="postal-code">{`${address.postalCode} / `}</span>
                    )}
                    {address.localizedCountry && (
                        <span className="country-name">{`${address.localizedCountry} `}</span>
                    )}
                </p>
            </div>
        </div>
    );
};

export function mapToStaticAddressProps(
    context: CheckoutContextProps,
    { type }: StaticAddressProps,
): WithCheckoutStaticAddressProps | null {
    const {
        checkoutState: {
            data: { getBillingCountries, getShippingCountries },
        },
    } = context;

    return {
        countries: type === AddressType.Billing
            ? getBillingCountries()
            : getShippingCountries(),
    };
}

export default withCheckout(mapToStaticAddressProps)(memo(StaticAddress));
