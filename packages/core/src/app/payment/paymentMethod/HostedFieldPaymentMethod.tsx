import {
    CheckoutSelectors,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { FormFieldContainer, Label } from '../../ui/form';
import { LoadingOverlay } from '../../ui/loading';

export interface HostedFieldPaymentMethodProps {
    cardCodeId?: string;
    cardExpiryId: string;
    cardNumberId: string;
    isInitializing?: boolean;
    method: PaymentMethod;
    postalCodeId?: string;
    walletButtons?: ReactNode;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
}

// TODO: Use HostedCreditCardFieldset
export default class HostedFieldPaymentMethod extends Component<HostedFieldPaymentMethodProps> {
    async componentDidMount(): Promise<void> {
        const { initializePayment, method, onUnhandledError = noop } = this.props;

        try {
            await initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    async componentWillUnmount(): Promise<void> {
        const { deinitializePayment, method, onUnhandledError = noop } = this.props;

        try {
            await deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    render(): ReactNode {
        const {
            cardCodeId,
            cardExpiryId,
            cardNumberId,
            isInitializing = false,
            postalCodeId,
            walletButtons,
        } = this.props;

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
    }
}
