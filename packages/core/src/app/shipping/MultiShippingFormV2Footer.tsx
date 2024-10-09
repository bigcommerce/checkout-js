import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { OrderComments } from '../orderComments';
import { Button, ButtonVariant } from '../ui/button';
import { Form } from '../ui/form';

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
        <Form>
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
        </Form>
    );
};

export default MultiShippingFormV2Footer;
