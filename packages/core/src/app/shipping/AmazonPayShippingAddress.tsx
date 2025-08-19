import { type Address, type ShippingInitializeOptions } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import React, { type FC, useCallback } from 'react';

import { type ShippingAddressProps } from './ShippingAddress';
import StaticAddressEditable from './StaticAddressEditable';

interface AmazonPayShippingAddressProps extends ShippingAddressProps {
    shippingAddress:  Address,
}

export const AmazonPayShippingAddress: FC<AmazonPayShippingAddressProps> = (props) => {
    const {
        methodId,
        formFields,
        onFieldChange,
        initialize,
        deinitialize,
        shippingAddress,
        isShippingStepPending,
    } = props;

    const initializeShipping = useCallback(
        memoizeOne(
            (defaultOptions: ShippingInitializeOptions) => (options?: ShippingInitializeOptions) =>
                initialize({
                    ...defaultOptions,
                    ...options,
                }),
        ),
        [],
    );

    const editAddressButtonId = 'edit-ship-button';

    const options: ShippingInitializeOptions = {
        amazonpay: {
            editAddressButtonId,
        },
    };

    return (
        <StaticAddressEditable
            address={shippingAddress}
            buttonId={editAddressButtonId}
            deinitialize={deinitialize}
            formFields={formFields}
            initialize={initializeShipping(options)}
            isLoading={isShippingStepPending}
            methodId={methodId}
            onFieldChange={onFieldChange}
        />
    );
};
