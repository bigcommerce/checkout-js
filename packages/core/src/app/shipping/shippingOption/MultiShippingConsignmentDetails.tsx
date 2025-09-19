import { type Cart, type Consignment } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { AddressType, StaticAddress } from '../../address';
import StaticConsignmentItemList from '../StaticConsignmentItemList';

export const ConsignmentDetails: React.FC<{ cart: Cart; consignment: Consignment }> = ({ cart, consignment }) => (
    <div className="staticConsignment">
        <strong>
            <TranslatedString id="shipping.shipping_address_heading" />
        </strong>
        <StaticAddress address={consignment.shippingAddress} type={AddressType.Shipping} />
        <StaticConsignmentItemList cart={cart} consignment={consignment} />
    </div>
);
