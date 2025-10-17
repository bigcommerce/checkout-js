import { type ShippingOption } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';

import { ShopperCurrency } from '../../currency';

import ShippingOptionAdditionalDescription from './ShippingOptionAdditionalDescription';
import './StaticShippingOption.scss';

interface StaticShippingOptionProps {
    displayAdditionalInformation?: boolean;
    method: ShippingOption;
    shippingCostAfterDiscount?: number;
}

const StaticShippingOption: React.FunctionComponent<StaticShippingOptionProps> = ({
    displayAdditionalInformation = true,
    method,
    shippingCostAfterDiscount,
}) => {
    const { themeV2 } = useThemeContext();

    const renderShippingPrice = () => {
        if (shippingCostAfterDiscount !== undefined && shippingCostAfterDiscount !== method.cost) {
            return (
                <>
                    <span className="shippingOption-price-before-discount">
                        <ShopperCurrency amount={method.cost} />
                    </span>
                    <ShopperCurrency amount={shippingCostAfterDiscount} />
                </>
            );
        }

        return (
            <ShopperCurrency amount={method.cost} />
        )

    }

    return (
        <div className="shippingOption shippingOption--alt" data-test="static-shipping-option">
            {method.imageUrl && (
                <span className="shippingOption-figure">
                    <img
                        alt={method.description}
                        className="shippingOption-img"
                        src={method.imageUrl}
                    />
                </span>
            )}
            <span className={classNames('shippingOption-desc', { 'body-medium': themeV2 })}>
                {method.description}
                {method.transitTime && (
                    <span className="shippingOption-transitTime">{method.transitTime}</span>
                )}
                {method.additionalDescription && displayAdditionalInformation && (
                    <ShippingOptionAdditionalDescription
                        description={method.additionalDescription}
                    />
                )}
            </span>
            <span className={classNames('shippingOption-price', { 'body-medium': themeV2 })}>
                {renderShippingPrice()}
            </span>
        </div>
    );
};

export default StaticShippingOption;
