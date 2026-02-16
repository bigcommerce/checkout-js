import {
    type Address,
    type CheckoutSelectors,
    type Country,
    type ShippingInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import { isEmpty } from 'lodash';
import React, { type FunctionComponent, memo } from 'react';

import { type CheckoutContextProps } from '@bigcommerce/checkout/contexts';
import { localizeAddress } from '@bigcommerce/checkout/locale';

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

    const address = localizeAddress(addressWithoutLocalization, countries);
    const isValid = !isEmpty(address);

    return !isValid ? null : (
        <div className="vcard checkout-address--static" data-test="static-address">
            {(address.firstName || address.lastName) && (
                <p className="fn address-entry body-regular">
                    <span className="first-name">{`${address.firstName} `}</span>
                    <span className="family-name">{address.lastName}</span>
                </p>
            )}

            {(address.phone || address.company) && (
                <p className="address-entry body-regular">
                    <span className="company-name">{`${address.company} `}</span>
                    <span className="tel">{address.phone}</span>
                </p>
            )}

            <div className="adr">
                <p className="street-address address-entry body-regular">
                    <span className="address-line-1">{`${address.address1} `}</span>
                    {address.address2 && (
                        <span className="address-line-2">{` / ${address.address2}`}</span>
                    )}
                </p>

                <p className="address-entry body-regular">
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
