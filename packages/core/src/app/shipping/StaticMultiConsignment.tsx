import { type Cart, type Consignment } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type FunctionComponent, memo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { localizeAddress, TranslatedString } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
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
    const { themeV2 } = useThemeContext();

    const { shippingAddress: addressWithoutLocalization, selectedShippingOption } = consignment;
    const address = localizeAddress(addressWithoutLocalization, getShippingCountries());
    const { paypalFastlaneAddresses } = usePayPalFastlaneAddress();
    const showPayPalFastlaneAddressLabel = isPayPalFastlaneAddress(address, paypalFastlaneAddresses);

    const lineItems = findLineItems(cart, consignment);

    return (
        <div className="staticMultiConsignment">
            <h3 className={classNames('staticMultiConsignment-header',
                { 'body-bold': themeV2 })}>
                <TranslatedString data={{ consignmentNumber }} id="shipping.multishipping_consignment_index_heading" />
            </h3>

            <div className="checkout-address--static">
                <p className={classNames('address-entry',
                    { 'sub-text': themeV2 })}>
                    <span className="first-name">{`${address.firstName} `}</span>
                    <span className="family-name">{address.lastName}</span>
                </p>
                <div className="address-details">
                    <p className={classNames('street-address address-entry',
                        { 'sub-text': themeV2 })}>
                        <span className="address-line-1">{address.address1}</span>
                        {address.address2 && (
                            <span className="address-line-2">{`, ${address.address2}`}</span>
                        )}
                    </p>

                    <p className={classNames('address-entry',
                        { 'sub-text': themeV2 })}>
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
                <span className={themeV2 ? 'body-bold' : ''}>
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
