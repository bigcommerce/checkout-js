
import { Cart, Consignment } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import StaticConsignment from './StaticConsignment';
import StaticMultiConsignment from './StaticMultiConsignment';


interface ShippingSummaryProps {
    isNewMultiShippingUIEnabled: boolean;
    isMultiShippingMode: boolean;
    consignments: Consignment[];
    cart: Cart;
}

const ShippingSummary: FunctionComponent<ShippingSummaryProps> = ({
    isNewMultiShippingUIEnabled,
    isMultiShippingMode,
    consignments,
    cart
}) => {
    if (isNewMultiShippingUIEnabled && isMultiShippingMode) {
        return (
            <>
                {consignments.map((consignment, index) => (
                    <div className="staticMultiConsignmentContainer" key={consignment.id}>
                        <StaticMultiConsignment
                            cart={cart}
                            consignment={consignment}
                            consignmentNumber={index + 1}
                        />
                    </div>
                ))}
            </>
        );
    }

    return (
        <>
            {consignments.map((consignment) => (
                <div className="staticConsignmentContainer" key={consignment.id}>
                    <StaticConsignment
                        cart={cart}
                        compactView={consignments.length < 2}
                        consignment={consignment}
                    />
                </div>
            ))}
        </>
    );
};

export default memo(ShippingSummary);
