import { type Cart, type Consignment } from '@bigcommerce/checkout-sdk';
import React, { type ReactElement } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { AddressType, StaticAddress } from '../../address';
import StaticConsignmentItemList from '../StaticConsignmentItemList';

interface ConsignmentDetailsProps {
    cart: Cart;
    consignment: Consignment;
}

export const ConsignmentDetails = ({ cart, consignment }: ConsignmentDetailsProps): ReactElement => (
    <div className="staticConsignment">
        <strong>
            <TranslatedString id="shipping.shipping_address_heading" />
        </strong>
        <StaticAddress address={consignment.shippingAddress} type={AddressType.Shipping} />
        <StaticConsignmentItemList cart={cart} consignment={consignment} />
    </div>
);
