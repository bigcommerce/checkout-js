import {
    AccountInstrument,
    CheckoutSelectors,
    PaymentInitializeOptions,
    PaymentInstrument,
    PaymentMethod,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { find, noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { MapToPropsFactory } from '@bigcommerce/checkout/legacy-hoc';
import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps, PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';
import { connectFormik, ConnectFormikProps } from '../../common/form';
import { LoadingOverlay } from '../../ui/loading';
import {
    AccountInstrumentFieldset,
    isAccountInstrument,
    isInstrumentFeatureAvailable,
} from '../storedInstrument';
import StoreInstrumentFieldset from '../StoreInstrumentFieldset';
import withPayment, { WithPaymentProps } from '../withPayment';

export interface HostedPaymentMethodProps {
    description?: ReactNode;
    isInitializing?: boolean;
    isUsingMultiShipping?: boolean;
    method: PaymentMethod;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
}

interface HostedPaymentMethodState {
    isAddingNewInstrument: boolean;
    selectedInstrument?: AccountInstrument;
}

interface WithCheckoutHostedPaymentMethodProps {
    instruments: AccountInstrument[];
    isInstrumentFeatureAvailable: boolean;
    isLoadingInstruments: boolean;
    isNewAddress: boolean;
    isPaymentDataRequired: boolean;
    loadInstruments(): Promise<CheckoutSelectors>;
}

class HostedPaymentMethod extends Component<
    HostedPaymentMethodProps &
        WithCheckoutHostedPaymentMethodProps &
        WithPaymentProps &
        WithLanguageProps &
        ConnectFormikProps<PaymentFormValues>,
    HostedPaymentMethodState
> {
    state: HostedPaymentMethodState = {
        isAddingNewInstrument: false,
    };

    async componentDidMount(): Promise<void> {
        const {
            initializePayment,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            loadInstruments,
            method,
            onUnhandledError = noop,
        } = this.props;

        try {
            await initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });

            if (isInstrumentFeatureAvailableProp) {
                await loadInstruments();
            }
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
            description,
            isInitializing = false,
            isLoadingInstruments,
            instruments,
            isNewAddress,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
        } = this.props;

        const { selectedInstrument = this.getDefaultInstrument() } = this.state;

        const isLoading = isInitializing || isLoadingInstruments;
        const shouldShowInstrumentFieldset =
            isInstrumentFeatureAvailableProp && (instruments.length > 0 || isNewAddress);

        if (!description && !isInstrumentFeatureAvailableProp) {
            return null;
        }

        return (
            <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                <div className="paymentMethod paymentMethod--hosted">
                    {description}

                    {shouldShowInstrumentFieldset && (
                        <AccountInstrumentFieldset
                            instruments={instruments}
                            onSelectInstrument={this.handleSelectInstrument}
                            onUseNewInstrument={this.handleUseNewInstrument}
                            selectedInstrument={selectedInstrument}
                        />
                    )}

                    {isInstrumentFeatureAvailableProp && (
                        <StoreInstrumentFieldset
                            instrumentId={selectedInstrument && selectedInstrument.bigpayToken}
                            isAccountInstrument={true}
                        />
                    )}
                </div>
            </LoadingOverlay>
        );
    }

    private getDefaultInstrument(): AccountInstrument | undefined {
        const { isAddingNewInstrument } = this.state;
        const { instruments } = this.props;

        if (isAddingNewInstrument || !instruments.length) {
            return;
        }

        return find(instruments, { defaultInstrument: true }) || instruments[0];
    }

    private handleUseNewInstrument: () => void = () => {
        this.setState({
            isAddingNewInstrument: true,
            selectedInstrument: undefined,
        });
    };

    private handleSelectInstrument: (id: string) => void = (id) => {
        const { instruments } = this.props;

        this.setState({
            isAddingNewInstrument: false,
            selectedInstrument: find(instruments, { bigpayToken: id }),
        });
    };
}

const mapFromCheckoutProps: MapToPropsFactory<
    CheckoutContextProps,
    WithCheckoutHostedPaymentMethodProps,
    HostedPaymentMethodProps & ConnectFormikProps<PaymentFormValues>
> = () => {
    const filterAccountInstruments = memoizeOne((instruments: PaymentInstrument[] = []) =>
        instruments.filter(isAccountInstrument),
    );
    const filterTrustedInstruments = memoizeOne((instruments: AccountInstrument[] = []) =>
        instruments.filter(({ trustedShippingAddress }) => trustedShippingAddress),
    );

    return (context, props) => {
        const { isUsingMultiShipping = false, method } = props;

        const { checkoutService, checkoutState } = context;

        const {
            data: {
                getCart,
                getConfig,
                getCustomer,
                getInstruments,
                isPaymentDataRequired,
                isPaymentDataSubmitted,
            },
            statuses: { isLoadingInstruments },
        } = checkoutState;

        const cart = getCart();
        const config = getConfig();
        const customer = getCustomer();

        if (!config || !cart || !customer || !method) {
            return null;
        }

        const currentMethodInstruments = filterAccountInstruments(getInstruments(method));
        const trustedInstruments = filterTrustedInstruments(currentMethodInstruments);

        return {
            instruments: trustedInstruments,
            isNewAddress: trustedInstruments.length === 0 && currentMethodInstruments.length > 0,
            isInstrumentFeatureAvailable:
                !isPaymentDataSubmitted(method.id, method.gateway) &&
                isInstrumentFeatureAvailable({
                    config,
                    customer,
                    isUsingMultiShipping,
                    paymentMethod: method,
                }),
            isLoadingInstruments: isLoadingInstruments(),
            isPaymentDataRequired: isPaymentDataRequired(),
            loadInstruments: checkoutService.loadInstruments,
        };
    };
};

export default connectFormik(
    withLanguage(withPayment(withCheckout(mapFromCheckoutProps)(HostedPaymentMethod))),
);
