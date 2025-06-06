import {
    Address,
    CheckoutSelectors,
    Country,
    ShippingInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import { isEmpty } from 'lodash';
import React, { FunctionComponent, memo } from 'react';

import { localizeAddress } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps , useStyleContext } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../checkout';

import AddressType from './AddressType';

import './StaticAddress.scss';


import classNames from 'classnames';

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

        const { newFontStyle } = useStyleContext();    

    const address = localizeAddress(addressWithoutLocalization, countries);
    const isValid = !isEmpty(address);

    return !isValid ? null : (
        <div className={classNames('vcard checkout-address--static',
            { 'body-regular': newFontStyle })}
            data-test="static-address">
            {(address.firstName || address.lastName) && (
                <span className="fn address-entry">
                    <span className="first-name">{`${address.firstName} `}</span>
                    <span className="family-name">{address.lastName}</span>
                </span>
            )}

            {(address.phone || address.company) && (
                <span className="address-entry">
                    <span className="company-name">{`${address.company} `}</span>
                    <span className="tel">{address.phone}</span>
                </span>
            )}

            <div className="adr">
                <span className="street-address address-entry">
                    <span className="address-line-1">{`${address.address1} `}</span>
                    {address.address2 && (
                        <span className="address-line-2">{` / ${address.address2}`}</span>
                    )}
                </span>

                <span className="address-entry">
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
                </span>
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
