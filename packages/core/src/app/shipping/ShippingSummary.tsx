
import { type Cart, type Consignment } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';

import StaticConsignment from './StaticConsignment';
import StaticConsignmentV2 from './StaticConsignmentV2';
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
    const { themeV2 } = useThemeContext();
    
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
                    {themeV2 ?
                        <StaticConsignmentV2
                            consignment={consignment}
                            isShippingDiscountDisplayEnabled={isShippingDiscountDisplayEnabled}
                        /> : 
                        <StaticConsignment
                            consignment={consignment}
                            isShippingDiscountDisplayEnabled={isShippingDiscountDisplayEnabled}
                    />}
                </div>
            ))}
        </>
    );
};

export default memo(ShippingSummary);
