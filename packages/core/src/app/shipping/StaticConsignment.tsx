import { type Consignment } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import { isPayPalFastlaneAddress, PoweredByPayPalFastlaneLabel, usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import { AddressType, StaticAddress } from '../address';

import { StaticShippingOption } from './shippingOption';
import './StaticConsignment.scss';

interface StaticConsignmentProps {
    consignment: Consignment;
    isShippingDiscountDisplayEnabled: boolean;
}

const StaticConsignment: FunctionComponent<StaticConsignmentProps> = ({
    consignment, 
    isShippingDiscountDisplayEnabled,
}) => {
    const { paypalFastlaneAddresses } = usePayPalFastlaneAddress();
    
    const { shippingAddress: address, selectedShippingOption, comparisonShippingCost } = consignment;
    const showPayPalFastlaneAddressLabel = isPayPalFastlaneAddress(address, paypalFastlaneAddresses);

    return (
        <div className="staticConsignment">
            <StaticAddress address={address} type={AddressType.Shipping} />

            {showPayPalFastlaneAddressLabel && <PoweredByPayPalFastlaneLabel />}

            {selectedShippingOption && (
                <div>
                    <div className="shippingOption shippingOption--alt shippingOption--selected">
                        <StaticShippingOption
                            displayAdditionalInformation={false}
                            method={selectedShippingOption}
                            shippingCostAfterDiscount={isShippingDiscountDisplayEnabled ? comparisonShippingCost : undefined}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(StaticConsignment);
