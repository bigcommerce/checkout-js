import {
    CheckoutSelectors,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { ReactElement, ReactNode, useEffect } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { FormFieldContainer, Label, LoadingOverlay } from '@bigcommerce/checkout/ui';

export interface HostedFieldPaymentMethodComponentProps {
    cardCodeId?: string;
    cardExpiryId: string;
    cardNumberId: string;
    isInitializing?: boolean;
    method: PaymentMethod;
    postalCodeId?: string;
    walletButtons?: ReactNode;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: unknown): void;
}

export const HostedFieldPaymentMethodComponent = ({
    cardCodeId,
    cardExpiryId,
    cardNumberId,
    isInitializing = false,
    postalCodeId,
    walletButtons,
    initializePayment,
    deinitializePayment,
    method,
    onUnhandledError = noop,
}: HostedFieldPaymentMethodComponentProps): ReactElement => {
    const initializePaymentMethod = async () => {
        try {
            await initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    };
    const deinitializePaymentMethod = async () => {
        try {
            await deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    };

    useEffect(() => {
        void initializePaymentMethod();

        return () => {
            void deinitializePaymentMethod();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isInitializing}>
            <div className="form-ccFields">
                {!!walletButtons && <FormFieldContainer>{walletButtons}</FormFieldContainer>}

                <FormFieldContainer additionalClassName="form-field--ccNumber">
                    <Label>
                        <TranslatedString id="payment.credit_card_number_label" />
                    </Label>

                    <div id={cardNumberId} />
                </FormFieldContainer>

                <FormFieldContainer additionalClassName="form-field--ccExpiry">
                    <Label>
                        <TranslatedString id="payment.credit_card_expiration_label" />
                    </Label>

                    <div id={cardExpiryId} />
                </FormFieldContainer>

                {!!cardCodeId && (
                    <FormFieldContainer additionalClassName="form-field--ccCvv">
                        <Label>
                            <TranslatedString id="payment.credit_card_cvv_label" />
                        </Label>

                        <div id={cardCodeId} />
                    </FormFieldContainer>
                )}

                {!!postalCodeId && (
                    <FormFieldContainer additionalClassName="form-field--postCode">
                        <Label>
                            <TranslatedString id="payment.postal_code_label" />
                        </Label>

                        <div id={postalCodeId} />
                    </FormFieldContainer>
                )}
            </div>
        </LoadingOverlay>
    );
};
