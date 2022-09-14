import React, { FunctionComponent, memo } from 'react';

import { preventDefault } from '../common/dom';
import { TranslatedString } from '../locale';
import { Legend } from '../ui/form';

interface ShippingHeaderProps {
    isMultiShippingMode: boolean;
    isGuest: boolean;
    shouldShowMultiShipping: boolean;
    onMultiShippingChange(): void;
}

const ShippingHeader: FunctionComponent<ShippingHeaderProps> = ({
    isMultiShippingMode,
    isGuest,
    onMultiShippingChange,
    shouldShowMultiShipping,
}) => (
    <div className="form-legend-container">
        <Legend testId="shipping-address-heading">
            <TranslatedString
                id={
                    isMultiShippingMode
                        ? isGuest
                            ? 'shipping.multishipping_address_heading_guest'
                            : 'shipping.multishipping_address_heading'
                        : 'shipping.shipping_address_heading'
                }
            />
        </Legend>

        {shouldShowMultiShipping && (
            <a
                data-test="shipping-mode-toggle"
                href="#"
                onClick={preventDefault(onMultiShippingChange)}
            >
                <TranslatedString
                    id={isMultiShippingMode ? 'shipping.ship_to_single' : 'shipping.ship_to_multi'}
                />
            </a>
        )}
    </div>
);

export default memo(ShippingHeader);
