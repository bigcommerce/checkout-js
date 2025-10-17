import { type Consignment } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { Alert, AlertType } from '@bigcommerce/checkout/ui';

import MultiShippingOptionsListV2 from './MultiShippingOptionsList';
import { isLoadingSelector } from './ShippingOptions';

interface MultiShippingOptionsV2Props {
    consignment: Consignment;
    isLoading: boolean;
    shippingQuoteFailedMessage: string;
    resetErrorConsignmentNumber(): void;
}

export const MultiShippingOptions = ({
    consignment,
    isLoading,
    resetErrorConsignmentNumber,
    shippingQuoteFailedMessage,
}: MultiShippingOptionsV2Props) => {
    const { checkoutService, checkoutState } = useCheckout();
    const { themeV2 } = useThemeContext();

    const selectShippingOption = async (consignmentId: string, shippingOptionId: string) => {
        await checkoutService.selectConsignmentShippingOption(consignmentId, shippingOptionId);
        resetErrorConsignmentNumber();
    };
    const isLoadingOptions = isLoadingSelector(checkoutState, isLoading)(consignment.id);

    return (
        <div>
            <h3 className={classNames('shipping-option-header',
                { 'body-bold': themeV2 })}
            >
                <TranslatedString id="shipping.shipping_method_label" />
            </h3>
            {(!consignment.availableShippingOptions ||
                !consignment.availableShippingOptions.length) && (
                    <Alert type={AlertType.Error}>{shippingQuoteFailedMessage}</Alert>
                )}
            {Boolean(consignment.availableShippingOptions) &&
                consignment.availableShippingOptions && (
                    <MultiShippingOptionsListV2
                        consignmentId={consignment.id}
                        isLoading={isLoadingOptions}
                        onSelectedOption={selectShippingOption}
                        selectedShippingOptionId={
                            consignment.selectedShippingOption &&
                            consignment.selectedShippingOption.id
                        }
                        shippingOptions={consignment.availableShippingOptions}
                    />
                )}
        </div>
    );
};
