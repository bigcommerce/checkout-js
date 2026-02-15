import { type Consignment } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Alert, AlertType } from '@bigcommerce/checkout/ui';

import { isErrorWithType } from '../../common/error';
import MultiShippingOptionsListV2 from './MultiShippingOptionsList';
import { isLoadingSelector } from './ShippingOptions';

interface MultiShippingOptionsV2Props {
    consignment: Consignment;
    isLoading: boolean;
    shippingQuoteFailedMessage: string;
    resetErrorConsignmentNumber(): void;
    onUnhandledError?(error: Error): void;
}

export const MultiShippingOptions = ({
    consignment,
    isLoading,
    resetErrorConsignmentNumber,
    shippingQuoteFailedMessage,
    onUnhandledError,
}: MultiShippingOptionsV2Props) => {
    const { checkoutService, checkoutState } = useCheckout();

    const selectShippingOption = async (consignmentId: string, shippingOptionId: string) => {
        try {
            await checkoutService.selectConsignmentShippingOption(consignmentId, shippingOptionId);
            resetErrorConsignmentNumber();
        } catch (error) {
            if (isErrorWithType(error) && error.type === 'empty_cart') {
                onUnhandledError?.(error);
            }
        }
    };
    const isLoadingOptions = isLoadingSelector(checkoutState, isLoading)(consignment.id);

    return (
        <div>
            <h3 className="shipping-option-header body-bold">
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
