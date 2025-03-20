import { Cart, Consignment } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { localizeAddress, TranslatedString } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { isPayPalFastlaneAddress, PoweredByPayPalFastlaneLabel, usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import ConsignmentLineItemDetail from './ConsignmentLineItemDetail';
import findLineItems from './findLineItems';
import getLineItemsCount from './getLineItemsCount';
import { StaticShippingOption } from './shippingOption';
import './StaticMultiConsignment.scss';
import getShippingAmountAfterAutomaticDiscount from './getShippingAmountAfterAutomaticDiscount';

interface StaticMultiConsignmentProps {
    consignment: Consignment;
    cart: Cart;
    consignmentNumber: number;
}

const StaticMultiConsignment: FunctionComponent<StaticMultiConsignmentProps> = ({
    consignment,
    cart,
    consignmentNumber,
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
            <h3 className="staticMultiConsignment-header">
                <TranslatedString data={{ consignmentNumber }} id="shipping.multishipping_consignment_index_heading" />
            </h3>

            <div className="checkout-address--static">
                <p className="address-entry">
                    <span className="first-name">{`${address.firstName} `}</span>
                    <span className="family-name">{address.lastName}</span>
                </p>
                <div className="address-details">
                    <p className="street-address address-entry">
                        <span className="address-line-1">{`${address.address1}`}</span>
                        {address.address2 && (
                            <span className="address-line-2">{`, ${address.address2}`}</span>
                        )}
                    </p>

                    <p className="address-entry">
                        {address.city && <span className="locality">{`${address.city}`}</span>}
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
            <strong>
                <TranslatedString
                    data={{ count: getLineItemsCount(lineItems) }}
                    id="cart.item_count_text"
                />
            </strong>
            
            <ConsignmentLineItemDetail lineItems={lineItems} />
        </div>

            {selectedShippingOption && (
                <div>
                    <div className="shippingOption shippingOption--alt shippingOption--selected">
                        <StaticShippingOption
                            displayAdditionalInformation={false}
                            method={selectedShippingOption}
                            shippingCostAfterDiscount={getShippingAmountAfterAutomaticDiscount(selectedShippingOption.cost, [consignment])}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(StaticMultiConsignment);
