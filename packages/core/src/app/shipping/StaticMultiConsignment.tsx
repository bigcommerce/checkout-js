import { type Cart, type Consignment } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { localizeAddress, TranslatedString } from '@bigcommerce/checkout/locale';
import { isPayPalFastlaneAddress, PoweredByPayPalFastlaneLabel, usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import ConsignmentLineItemDetail from './ConsignmentLineItemDetail';
import findLineItems from './findLineItems';
import getLineItemsCount from './getLineItemsCount';
import getShippingCostAfterAutomaticDiscount from './getShippingCostAfterAutomaticDiscount';
import { StaticShippingOption } from './shippingOption';

import './StaticMultiConsignment.scss';

interface StaticMultiConsignmentProps {
    consignment: Consignment;
    cart: Cart;
    consignmentNumber: number;
    isShippingDiscountDisplayEnabled: boolean;
}

const StaticMultiConsignment: FunctionComponent<StaticMultiConsignmentProps> = ({
    consignment,
    cart,
    consignmentNumber,
    isShippingDiscountDisplayEnabled,
}) => {
    const {
        checkoutState: {
            data: { getShippingCountries },
        },
    } = useCheckout();

    const { shippingAddress: addressWithoutLocalization, selectedShippingOption } = consignment;
    const address = localizeAddress(addressWithoutLocalization, getShippingCountries());
    const { paypalFastlaneAddresses } = usePayPalFastlaneAddress();
    const showPayPalFastlaneAddressLabel = isPayPalFastlaneAddress(address, paypalFastlaneAddresses);

    const lineItems = findLineItems(cart, consignment);

    return (
        <div className="staticMultiConsignment">
            <h3 className="staticMultiConsignment-header body-bold">
                <TranslatedString data={{ consignmentNumber }} id="shipping.multishipping_consignment_index_heading" />
            </h3>

            <div className="checkout-address--static">
                <p className="address-entry sub-text">
                    <span className="first-name">{`${address.firstName} `}</span>
                    <span className="family-name">{address.lastName}</span>
                </p>
                <div className="address-details">
                    <p className="street-address address-entry sub-text">
                        <span className="address-line-1">{address.address1}</span>
                        {address.address2 && (
                            <span className="address-line-2">{`, ${address.address2}`}</span>
                        )}
                    </p>

                    <p className="address-entry sub-text">
                        {address.city && <span className="locality">{address.city}</span>}
                        {address.localizedProvince && (
                            <span className="region">{`, ${address.localizedProvince}`}</span>
                        )}
                        {address.localizedCountry && (
                            <span className="country-name">{`, ${address.localizedCountry}`}</span>
                        )}
                        {address.postalCode && (
                            <span className="postal-code">{` ${address.postalCode}`}</span>
                        )}
                    </p>
                </div>
            </div>

            {showPayPalFastlaneAddressLabel && <PoweredByPayPalFastlaneLabel />}

            <div className="staticConsignment-items">
                <span className="body-bold">
                <TranslatedString
                    data={{ count: getLineItemsCount(lineItems) }}
                    id="cart.item_count_text"
                />
                </span>

                <ConsignmentLineItemDetail isMultiShippingSummary lineItems={lineItems} />
        </div>

            {selectedShippingOption && (
                <div>
                    <div className="shippingOption shippingOption--alt shippingOption--selected">
                        <StaticShippingOption
                            displayAdditionalInformation={false}
                            method={selectedShippingOption}
                            shippingCostAfterDiscount={isShippingDiscountDisplayEnabled ? getShippingCostAfterAutomaticDiscount(selectedShippingOption.cost, [consignment]) : undefined}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(StaticMultiConsignment);
