import { Cart, Consignment } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { AddressType, StaticAddress } from '../address';
import { isPayPalConnectAddress, PoweredByPaypalConnectLabel, usePayPalConnectAddress } from '../address/PayPalAxo';

import { StaticShippingOption } from './shippingOption';
import './StaticConsignment.scss';
import StaticConsignmentItemList from './StaticConsignmentItemList';

interface StaticConsignmentProps {
    consignment: Consignment;
    cart: Cart;
    compactView?: boolean;
}

const StaticConsignment: FunctionComponent<StaticConsignmentProps> = ({
    consignment,
    cart,
    compactView,
}) => {
    const { isPayPalAxoEnabled, paypalConnectAddresses } = usePayPalConnectAddress();
    const { shippingAddress: address, selectedShippingOption } = consignment;

    const showPayPalConnectAddressLabel = isPayPalAxoEnabled && isPayPalConnectAddress(address, paypalConnectAddresses);

    return (
        <div className="staticConsignment">
            <StaticAddress address={address} type={AddressType.Shipping} />

            {showPayPalConnectAddressLabel && <PoweredByPaypalConnectLabel />}

            {!compactView && <StaticConsignmentItemList cart={cart} consignment={consignment} />}

            {selectedShippingOption && (
                <div>
                    <div className="shippingOption shippingOption--alt shippingOption--selected">
                        <StaticShippingOption
                            displayAdditionalInformation={false}
                            method={selectedShippingOption}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(StaticConsignment);
