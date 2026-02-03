import { type Consignment } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import { isPayPalFastlaneAddress, PoweredByPayPalFastlaneLabel, usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import { AddressType, StaticAddress } from '../address';

import getShippingCostAfterAutomaticDiscount from './getShippingCostAfterAutomaticDiscount';
import { StaticShippingOption } from './shippingOption';
import './StaticConsignment.scss';

interface StaticConsignmentV2Props {
    consignment: Consignment;
    isShippingDiscountDisplayEnabled: boolean;
}

const StaticConsignmentV2: FunctionComponent<StaticConsignmentV2Props> = ({
    consignment, 
    isShippingDiscountDisplayEnabled,
}) => {
    const { paypalFastlaneAddresses } = usePayPalFastlaneAddress();
    
    const { shippingAddress: address, selectedShippingOption } = consignment;
    const showPayPalFastlaneAddressLabel = isPayPalFastlaneAddress(address, paypalFastlaneAddresses);

    return (
        <div className="staticConsignment flex-row">
            <div className="flex-column shipping-address-container">
                <p className="title">Shipping address</p>
                <StaticAddress address={address} type={AddressType.Shipping} />
                {showPayPalFastlaneAddressLabel && <PoweredByPayPalFastlaneLabel />}
            </div>

            {selectedShippingOption && (
                <div className="flex-column shipping-method">
                    <p className="title">Shipping method</p>
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

export default memo(StaticConsignmentV2);
