import { Address } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';
import { LocalizedGeography } from '../geography';

import localizeAddress from './localizeAddress';
import './StaticAddress.scss';

interface StaticAddressProps {
    address: Address;
}

interface WithCheckoutStaticAddressProps {
    localizedAddress: Address & LocalizedGeography;
}

const StaticAddress: React.FunctionComponent<StaticAddressProps & WithCheckoutStaticAddressProps> = ({ localizedAddress: address }) => (
    <div className="vcard checkout-address--static">
        <p className="fn address-entry">
            <span className="first-name">{ address.firstName } </span>
            <span className="family-name">{ address.lastName }</span>
        </p>

        {
            (address.phone || address.company) &&
            <p className="address-entry">
                <span className="company-name">{ address.company } </span>
                <span className="tel">{ address.phone }</span>
            </p>
        }

        <div className="adr">
            <p className="street-address address-entry">
                <span className="address-line-1">{ address.address1 } </span>
                {
                    address.address2 &&
                    <span className="address-line-2">
                        / { address.address2 }
                    </span>
                }
            </p>
            <p className="address-entry">
                <span className="locality">{ address.city }, </span>
                {
                    address.localizedProvince &&
                    <span className="region">{ address.localizedProvince }, </span>
                }
                <span className="postal-code">{ address.postalCode } / </span>
                <span className="country-name">{ address.localizedCountry } </span>
            </p>
        </div>
    </div>
);

export function mapToStaticAddressProps(
    context: CheckoutContextProps,
    { address }: StaticAddressProps
): WithCheckoutStaticAddressProps | null {
    const {
        checkoutState: {
            data: {
                getBillingCountries,
            },
        },
    } = context;

    return {
        localizedAddress: localizeAddress(
            address,
            getBillingCountries()
        ),
    };
}

export default withCheckout(mapToStaticAddressProps)(StaticAddress);
