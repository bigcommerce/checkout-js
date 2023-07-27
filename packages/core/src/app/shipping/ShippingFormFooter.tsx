import { ExtensionRegion } from '@bigcommerce/checkout-sdk';
import React, { PureComponent, ReactNode } from 'react';

import {
    ExtensionContextProps,
    ExtensionRegionContainer,
    withExtension,
} from '@bigcommerce/checkout/checkout-extension';
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
    isLoading: boolean;
}

class ShippingFormFooter extends PureComponent<ShippingFormFooterProps & ExtensionContextProps> {
    private isRegionInUse = false;

    componentWillUnmount(): void {
        const { extensionService } = this.props;

        if (this.isRegionInUse) {
            extensionService.removeListeners(ExtensionRegion.ShippingShippingAddressFormAfter);
        }
    }

    async componentDidMount(): Promise<void> {
        const { extensionService } = this.props;

        if (this.isRegionInUse) {
            await extensionService.renderExtension(
                ExtensionRegionContainer.ShippingShippingAddressFormAfter,
                ExtensionRegion.ShippingShippingAddressFormAfter,
            );
        }
    }

    render(): ReactNode {
        const {
            cartHasChanged,
            extensionService,
            isMultiShippingMode,
            isExtensionEnabled,
            shouldShowOrderComments,
            shouldShowShippingOptions = true,
            shouldDisableSubmit,
            isLoading,
        } = this.props;

        this.isRegionInUse = Boolean(
            isExtensionEnabled &&
                extensionService.isRegionInUse(ExtensionRegion.ShippingShippingAddressFormAfter),
        );

        return (
            <>
                {this.isRegionInUse && (
                    <div id={ExtensionRegionContainer.ShippingShippingAddressFormAfter} />
                )}
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

export default withExtension(ShippingFormFooter);
