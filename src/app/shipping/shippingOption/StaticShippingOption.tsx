import { ShippingOption } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { ShopperCurrency } from '../../currency';

import './StaticShippingOption.scss';

interface StaticShippingOptionProps {
    method: ShippingOption;
}

const StaticShippingOption: React.FunctionComponent<StaticShippingOptionProps> = ({ method }) => (
    <div className="shippingOption shippingOption--alt">
        { method.imageUrl &&
            <span className="shippingOption-figure">
                <img alt={ method.description }
                    className="shippingOption-img"
                    src={ method.imageUrl }
                />
            </span>
        }
        <span className="shippingOption-desc">
            { method.description }
            { method.transitTime &&
                <span className="shippingOption-transitTime">
                    { method.transitTime }
                </span>
            }
        </span>
        <span className="shippingOption-price">
            <ShopperCurrency amount={ method.cost } />
        </span>
    </div>
);

export default StaticShippingOption;
