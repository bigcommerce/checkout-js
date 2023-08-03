import { Cart, Consignment } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { AddressType, StaticAddress } from '../../address';
import { PoweredByPaypalConnectLabel, usePayPalConnectAddress } from '../../address/PayPalAxo';
import { StaticShippingOption } from '../shippingOption';
import StaticConsignmentItemList from '../StaticConsignmentItemList';

import '../StaticConsignment.scss';

interface PayPalAxoStaticConsignmentProps {
    consignment: Consignment;
    cart: Cart;
    compactView?: boolean;
}

const PayPalAxoStaticConsignment: FunctionComponent<PayPalAxoStaticConsignmentProps> = ({
    consignment,
    cart,
    compactView,
}) => {
    const { shippingAddress: address, selectedShippingOption } = consignment;
    const { isPayPalConnectAddress } = usePayPalConnectAddress();

    return (
        <div className="staticConsignment">
            <StaticAddress address={address} type={AddressType.Shipping} />

            {isPayPalConnectAddress(address) && <PoweredByPaypalConnectLabel />}

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

export default memo(PayPalAxoStaticConsignment);
