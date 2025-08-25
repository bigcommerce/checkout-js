
import { type Cart, type Consignment } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import StaticConsignment from './StaticConsignment';
import StaticMultiConsignment from './StaticMultiConsignment';

interface ShippingSummaryProps {
    isShippingDiscountDisplayEnabled: boolean;
    isMultiShippingMode: boolean;
    consignments: Consignment[];
    cart: Cart;
}

const ShippingSummary: FunctionComponent<ShippingSummaryProps> = ({
    isShippingDiscountDisplayEnabled,
    isMultiShippingMode,
    consignments,
    cart
}) => {
    if (isMultiShippingMode) {
        return (
            <>
                {consignments.map((consignment, index) => (
                    <div className="staticMultiConsignmentContainer" key={consignment.id}>
                        <StaticMultiConsignment
                            cart={cart}
                            consignment={consignment}
                            consignmentNumber={index + 1}
                            isShippingDiscountDisplayEnabled={isShippingDiscountDisplayEnabled}
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
                        isShippingDiscountDisplayEnabled={isShippingDiscountDisplayEnabled}
                    />
                </div>
            ))}
        </>
    );
};

export default memo(ShippingSummary);
