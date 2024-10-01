import { ExtensionRegion } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { OrderComments } from '../orderComments';
import { Button, ButtonVariant } from '../ui/button';

export interface ShippingFormFooterProps {
    shouldShowOrderComments: boolean;
    shouldDisableSubmit: boolean;
    isLoading: boolean;
}

const MultiShippingFormV2Footer: FunctionComponent<ShippingFormFooterProps> = ({
    shouldShowOrderComments,
    shouldDisableSubmit,
    isLoading,
}) => {
    return (
        <>
            <Extension region={ExtensionRegion.ShippingShippingAddressFormAfter} />
            {shouldShowOrderComments && <OrderComments />}

            <div className="form-actions">
                <Button
                    disabled={shouldDisableSubmit}
                    id="checkout-shipping-continue"
                    isLoading={isLoading}
                    type="submit"
                    variant={ButtonVariant.Primary}
                >
                    <TranslatedString id="common.continue_action" />
                </Button>
            </div>
        </>
    );
};

export default MultiShippingFormV2Footer;
