import { type Cart, type Consignment } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';

import StaticConsignment from './StaticConsignment';
import StaticConsignmentV2 from './StaticConsignmentV2';
import StaticMultiConsignment from './StaticMultiConsignment';

interface ShippingSummaryProps {
    isMultiShippingMode: boolean;
    consignments: Consignment[];
    cart: Cart;
}

const ShippingSummary: FunctionComponent<ShippingSummaryProps> = ({
    isMultiShippingMode,
    consignments,
    cart,
}) => {
    const { enhancedThemeV1 } = useThemeContext();

    if (isMultiShippingMode) {
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
                    {enhancedThemeV1 ? (
                        <StaticConsignmentV2 consignment={consignment} />
                    ) : (
                        <StaticConsignment consignment={consignment} />
                    )}
                </div>
            ))}
        </>
    );
};

export default memo(ShippingSummary);
