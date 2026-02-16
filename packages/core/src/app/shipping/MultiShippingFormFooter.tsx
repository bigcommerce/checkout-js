import React, { type FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { OrderComments } from '../orderComments';
import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { Form } from '../ui/form';

export interface ShippingFormFooterProps {
    shouldShowOrderComments: boolean;
    shouldDisableSubmit: boolean;
    isLoading: boolean;
    cartHasChanged: boolean;
}

const MultiShippingFormFooter: FunctionComponent<ShippingFormFooterProps> = ({
    shouldShowOrderComments,
    shouldDisableSubmit,
    isLoading,
    cartHasChanged,
}) => {
    return (
        <Form>
            {cartHasChanged && (
                <Alert type={AlertType.Error}>
                    <strong>
                        <TranslatedString id="shipping.cart_change_error" />
                    </strong>
                </Alert>
            )}
            {shouldShowOrderComments && <OrderComments />}

            <div className="form-actions">
                <Button
                    className="body-bold"
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

export default MultiShippingFormFooter;
