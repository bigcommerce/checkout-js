// @ts-nocheck
import React, { PureComponent, ReactNode } from 'react';
import { withFormik } from 'formik';

import { withLanguage, TranslatedString, WithLanguageProps } from '../../locale';
import { OrderComments } from '../../orderComments';
import { Alert, AlertType } from '../../ui/alert';
import { Button, ButtonVariant } from '../../ui/button';
import { Fieldset, Legend } from '../../ui/form';

import { ShippingOptions } from '../../shipping/shippingOption';

export interface ShippingFormFooterProps {
    cartHasChanged: boolean;
    shouldShowOrderComments: boolean;
    shouldShowShippingOptions?: boolean;
    shouldDisableSubmit: boolean;
    isLoading: boolean;
    customerMessage: string;
    onSubmit: any;
    handleSubmit?: any;
}

class ShippingFormFooter extends PureComponent<ShippingFormFooterProps> {
    render(): ReactNode {
        const {
            cartHasChanged,
            shouldShowOrderComments,
            shouldShowShippingOptions = true,
            shouldDisableSubmit,
            isLoading,
        } = this.props;

        return <>
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
                    isMultiShippingMode={ true }
                    isUpdatingAddress={ isLoading }
                    shouldShowShippingOptions={ shouldShowShippingOptions }
                />
            </Fieldset>

            { shouldShowOrderComments &&
                <OrderComments /> }

            <div className="form-actions">
                <Button
                    disabled={ shouldDisableSubmit }
                    id="checkout-shipping-continue"
                    isLoading={ isLoading }
                    type="submit"
                    variant={ ButtonVariant.Primary }
                    onClick={ (e) => {
                      e.preventDefault();
                      this.props.handleSubmit(e);
                    }}
                >
                    <TranslatedString id="common.continue_action" />
                </Button>
            </div>
        </>;
    }
}

export interface MultiShippingFormValues {
    orderComment: string;
}

export default withLanguage(withFormik<ShippingFormFooterProps & WithLanguageProps, MultiShippingFormValues>({
    handleSubmit: (values, { props: { onSubmit } }) => {
        onSubmit(values);
    },
    mapPropsToValues: ({ customerMessage }) => ({
        orderComment: customerMessage,
    }),
    enableReinitialize: true,
})(ShippingFormFooter));
