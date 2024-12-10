import {
    Address,
    CheckoutSelectors,
    Country,
    FormField,
    ShippingInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { localizeAddress } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../checkout';
import { isExperimentEnabled } from '../common/utility';

import AddressType from './AddressType';
import isValidStaticAddress from './isValidStaticAddress';

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
    fields?: FormField[];
    validateAddressFields?: boolean;
}

const StaticAddress: FunctionComponent<
    StaticAddressEditableProps & WithCheckoutStaticAddressProps
    > = ({
        countries,
        fields,
        address: addressWithoutLocalization,
        validateAddressFields = false,
    }) => {
    const address = localizeAddress(addressWithoutLocalization, countries);
    const isValid = isValidStaticAddress(address, validateAddressFields, fields);

    return !isValid ? null : (
        <div className="vcard checkout-address--static" data-test="static-address">
            {(address.firstName || address.lastName) && (
                <p className="fn address-entry">
                    <span className="first-name">{`${address.firstName} `}</span>
                    <span className="family-name">{address.lastName}</span>
                </p>
            )}

            {(address.phone || address.company) && (
                <p className="address-entry">
                    <span className="company-name">{`${address.company} `}</span>
                    <span className="tel">{address.phone}</span>
                </p>
            )}

            <div className="adr">
                <p className="street-address address-entry">
                    <span className="address-line-1">{`${address.address1} `}</span>
                    {address.address2 && (
                        <span className="address-line-2">{` / ${address.address2}`}</span>
                    )}
                </p>

                <p className="address-entry">
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
    { address, type }: StaticAddressProps,
): WithCheckoutStaticAddressProps | null {
    const {
        checkoutState: {
            data: { getConfig, getBillingCountries, getShippingCountries, getBillingAddressFields, getShippingAddressFields },
        },
    } = context;

    const config = getConfig();

    const validateAddressFields =
        isExperimentEnabled(
            config?.checkoutSettings,
            'CHECKOUT-7560.address_fields_max_length_validation',
        );

    return {
        countries: type === AddressType.Billing
            ? getBillingCountries()
            : getShippingCountries(),
        fields:
            type === AddressType.Billing
                ? getBillingAddressFields(address.countryCode)
                : type === AddressType.Shipping
                ? getShippingAddressFields(address.countryCode)
                : undefined,
        validateAddressFields,
    };
}

export default withCheckout(mapToStaticAddressProps)(memo(StaticAddress));
