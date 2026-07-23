import { type Consignment } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type FunctionComponent, memo } from 'react';

import {
    isPayPalFastlaneAddress,
    PoweredByPayPalFastlaneLabel,
    usePayPalFastlaneAddress,
} from '@bigcommerce/checkout/paypal-fastlane-integration';
import { isMobileView } from '@bigcommerce/checkout/ui';

import { AddressType, StaticAddress } from '../address';

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
    const isMobile = isMobileView();

    const {
        shippingAddress: address,
        selectedShippingOption,
        comparisonShippingCost,
    } = consignment;
    const showPayPalFastlaneAddressLabel = isPayPalFastlaneAddress(
        address,
        paypalFastlaneAddresses,
    );

    return (
        <div
            className={classNames(
                'staticConsignment',
                { 'flex-row': !isMobile },
                { 'flex-column': isMobile },
            )}
        >
            <div className="flex-column shipping-address-container">
                <StaticAddress address={address} type={AddressType.Shipping} />
                {showPayPalFastlaneAddressLabel && <PoweredByPayPalFastlaneLabel />}
            </div>

            {selectedShippingOption && (
                <div className="flex-column shipping-method">
                    <div className="shippingOption shippingOption--alt shippingOption--selected">
                        <StaticShippingOption
                            displayAdditionalInformation={false}
                            method={selectedShippingOption}
                            shippingCostAfterDiscount={
                                isShippingDiscountDisplayEnabled
                                    ? comparisonShippingCost
                                    : undefined
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(StaticConsignmentV2);
