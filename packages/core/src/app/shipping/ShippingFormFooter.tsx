import React, { PureComponent, ReactNode } from 'react';

import { TranslatedString } from '../locale';
import { OrderComments } from '../orderComments';
import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { Fieldset, Legend } from '../ui/form';

import { ShippingOptions } from './shippingOption';

export interface ShippingFormFooterProps {
    cartHasChanged: boolean;
    isMultiShippingMode: boolean;
    shouldShowOrderComments: boolean;
    shouldShowShippingOptions?: boolean;
    shouldDisableSubmit: boolean;
    isLoading: boolean;
}

class ShippingFormFooter extends PureComponent<ShippingFormFooterProps> {
    render(): ReactNode {
        const {
            cartHasChanged,
            isMultiShippingMode,
            shouldShowOrderComments,
            shouldShowShippingOptions = true,
            shouldDisableSubmit,
            isLoading,
        } = this.props;

        return (
            <>
                <Fieldset
                    id="checkout-shipping-options"
                    legend={
                        <>
                            <Legend>
                                <TranslatedString id="shipping.shipping_method_label" />
                            </Legend>

                            {cartHasChanged && (
                                <Alert type={AlertType.Error}>
                                    <strong>
                                        <TranslatedString id="shipping.cart_change_error" />
                                    </strong>
                                </Alert>
                            )}
                        </>
                    }
                >
                    <ShippingOptions
                        isMultiShippingMode={isMultiShippingMode}
                        isUpdatingAddress={isLoading}
                        shouldShowShippingOptions={shouldShowShippingOptions}
                    />
                </Fieldset>

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
    }
}

export default ShippingFormFooter;
