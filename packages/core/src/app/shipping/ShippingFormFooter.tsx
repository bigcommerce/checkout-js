import { ExtensionRegion } from '@bigcommerce/checkout-sdk/essential';
import React, { type FunctionComponent } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';

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
    isInitialValueLoaded: boolean;
    isLoading: boolean;
    shippingFormRenderTimestamp?: number;
}

const ShippingFormFooter: FunctionComponent<ShippingFormFooterProps> = ({
    cartHasChanged,
    isMultiShippingMode,
    shouldShowOrderComments,
    shouldShowShippingOptions = true,
    shouldDisableSubmit,
    isInitialValueLoaded,
    isLoading,
    shippingFormRenderTimestamp,
}) => {
    const { themeV2 } = useThemeContext();

    return (
        <>
            <Extension region={ExtensionRegion.ShippingShippingAddressFormAfter} />
            <Fieldset
                id="checkout-shipping-options"
                legend={
                    <>
                        <Legend themeV2={themeV2}>
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

            {shouldShowOrderComments && <OrderComments />}

            <div className="form-actions">
                <Button
                    className={themeV2 ? 'body-bold' : ''}
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
