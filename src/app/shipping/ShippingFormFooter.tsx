import React, { PureComponent, ReactNode } from 'react';

import { TranslatedString } from '../locale';
import { OrderComments } from '../orderComments';
import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { Fieldset, Legend } from '../ui/form';

import { ShippingOptions } from './shippingOption';

export interface ShippingFormFooterProps {
    isDatePicked: boolean;
    onDatePicked: () => void;
    cartHasChanged: boolean;
    isMultiShippingMode: boolean;
    shouldShowOrderComments: boolean;
    shouldShowShippingOptions?: boolean;
    shouldDisableSubmit: boolean;
    isLoading: boolean;
    isMessengerDelivery: boolean;
    isShippingOnly: boolean;
    hasGiftOption: boolean;
    hasShipByDate: boolean;
    shipByDate: string;
    toggleGiftOption: () => void;
    setShipByDate(value: string): void;
    isPickupOnly: boolean;
}

class ShippingFormFooter extends PureComponent<ShippingFormFooterProps> {
    render(): ReactNode {
        const {
            isDatePicked,
            onDatePicked,
            cartHasChanged,
            isMultiShippingMode,
            shouldShowOrderComments,
            shouldShowShippingOptions = true,
            shouldDisableSubmit,
            isLoading,
            isMessengerDelivery,
            isShippingOnly,
            hasGiftOption,
            hasShipByDate,
            shipByDate,
            toggleGiftOption,
            setShipByDate,
            isPickupOnly
        } = this.props;

        const shippingMethodsComponent = (
            <Fieldset
                id="checkout-shipping-options"
                legend={
                    <>
                        <Legend>
                            <TranslatedString id="shipping.shipping_method_label" />
                        </Legend>

                        { cartHasChanged &&
                            <Alert type={ AlertType.Error }>
                                <strong>
                                    <TranslatedString id="shipping.cart_change_error" />
                                </strong>
                            </Alert> }
                    </>
                }
            > 
                <ShippingOptions
                    isMultiShippingMode={ isMultiShippingMode }
                    isUpdatingAddress={ isLoading }
                    shouldShowShippingOptions={ shouldShowShippingOptions }
                    isMessengerDelivery={ isMessengerDelivery }
                    isShippingOnly={ isShippingOnly }
                />
            </Fieldset>
        );

        return <>
            {!isPickupOnly && shippingMethodsComponent }
            { shouldShowOrderComments &&
                <OrderComments 
                    onDatePicked={onDatePicked}
                    hasGiftOption={ hasGiftOption }
                    hasShipByDate={ hasShipByDate }
                    shipByDate={ shipByDate }
                    toggleGiftOption={ toggleGiftOption }
                    setShipByDate={ setShipByDate }
                    isDate=''
                    heading=''
                    isPickupOnly={ isPickupOnly }
                /> 
            }

            <div className="form-actions">
                <Button
                    disabled={ isPickupOnly ? false : (!isDatePicked ? true : shouldDisableSubmit) }
                    id="checkout-shipping-continue"
                    isLoading={ isLoading }
                    type="submit"
                    variant={ ButtonVariant.Primary }
                >
                    <TranslatedString id="common.continue_action" />
                </Button>
            </div>
        </>;
    }
}

export default ShippingFormFooter;
