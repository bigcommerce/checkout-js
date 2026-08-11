import React, { type FunctionComponent } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Alert, AlertType, Button, ButtonVariant, Form } from '@bigcommerce/checkout/ui';

import { OrderComments } from '../orderComments';

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
    const { enhancedThemeV1 } = useThemeContext();

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
                    className="optimizedCheckout-contentPrimary body-bold"
                    disabled={shouldDisableSubmit}
                    id="checkout-shipping-continue"
                    isLoading={isLoading}
                    type="submit"
                    variant={ButtonVariant.Primary}
                >
                    <TranslatedString
                        id={
                            enhancedThemeV1
                                ? 'common.continue_to_payment_action'
                                : 'common.continue_action'
                        }
                    />
                </Button>
            </div>
        </Form>
    );
};

export default MultiShippingFormFooter;
