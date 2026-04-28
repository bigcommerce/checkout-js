import { ExtensionRegion } from '@bigcommerce/checkout-sdk/essential';
import React, { type FunctionComponent } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Alert, AlertType, Button, ButtonVariant } from '@bigcommerce/checkout/ui';

import { OrderComments } from '../orderComments';
import { Fieldset, Legend } from '../ui/form';

import { ShippingOptions } from './shippingOption';

export interface ShippingFormFooterProps {
    cartHasChanged: boolean;
    defaultShippingExpectationMessage?: string;
    isMultiShippingMode: boolean;
    shouldShowOrderComments: boolean;
    shouldShowShippingOptions?: boolean;
    shouldDisableSubmit: boolean;
    isInitialValueLoaded: boolean;
    isLoading: boolean;
    shippingFormRenderTimestamp?: number;
}

const ShippingFormFooter: FunctionComponent<ShippingFormFooterProps> = ({
    cartHasChanged,
    defaultShippingExpectationMessage,
    isMultiShippingMode,
    shouldShowOrderComments,
    shouldShowShippingOptions = true,
    shouldDisableSubmit,
    isInitialValueLoaded,
    isLoading,
    shippingFormRenderTimestamp,
}) => {
    return (
        <>
            <Extension region={ExtensionRegion.ShippingShippingAddressFormAfter} />
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
                    isInitialValueLoaded={isInitialValueLoaded}
                    isMultiShippingMode={isMultiShippingMode}
                    isUpdatingAddress={isLoading}
                    shippingFormRenderTimestamp={shippingFormRenderTimestamp}
                    shouldShowShippingOptions={shouldShowShippingOptions}
                />
            </Fieldset>

            {defaultShippingExpectationMessage && <p>{defaultShippingExpectationMessage}</p>}

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
        </>
    );
};

export default ShippingFormFooter;
