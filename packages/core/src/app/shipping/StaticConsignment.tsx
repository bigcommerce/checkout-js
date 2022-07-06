import { Cart, Consignment } from '@bigcommerce/checkout-sdk';
import React, { memo, FunctionComponent } from 'react';

import { AddressType, StaticAddress } from '../address';
import { TranslatedString } from '../locale';

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
    const {
        shippingAddress: address,
        selectedShippingOption,
    } = consignment;

    return (
        <div className="staticConsignment">
            { !compactView &&
                <strong>
                    <TranslatedString id="shipping.shipping_address_heading" />
                </strong> }

            <StaticAddress
                address={ address }
                type={ AddressType.Shipping }
            />

            { !compactView &&
                <StaticConsignmentItemList
                    cart={ cart }
                    consignment={ consignment }
                /> }

            { selectedShippingOption &&
                <div>
                    { !compactView &&
                        <strong>
                            <TranslatedString id="shipping.shipping_method_label" />
                        </strong> }
                    <div className="shippingOption shippingOption--alt">
                        <StaticShippingOption
                            displayAdditionalInformation={ false }
                            method={ selectedShippingOption }
                        />
                    </div>
                </div> }
        </div>
    );
};

export default memo(StaticConsignment);
