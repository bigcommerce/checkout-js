import {
    AccountInstrument,
    CheckoutSelectors,
    CheckoutService,
    LanguageService,
    PaymentInitializeOptions,
    PaymentInstrument,
    PaymentMethod,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { find, noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import {
    AccountInstrumentFieldset,
    isAccountInstrument,
    isInstrumentFeatureAvailable,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import { PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

export interface HostedPaymentMethodProps {
    checkoutService: CheckoutService;
    checkoutState: CheckoutSelectors;
    description?: ReactNode;
    isInitializing?: boolean;
    isUsingMultiShipping?: boolean;
    language: LanguageService;
    method: PaymentMethod;
    paymentForm: PaymentFormService;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
}

interface HostedPaymentMethodState {
    isAddingNewInstrument: boolean;
    selectedInstrument?: AccountInstrument;
}

interface HostedPaymentMethodDerivedProps {
    instruments: AccountInstrument[];
    isInstrumentFeatureAvailable: boolean;
    isLoadingInstruments: boolean;
    isNewAddress: boolean;
    isPaymentDataRequired: boolean;
    loadInstruments(): Promise<CheckoutSelectors>;
}

function getHostedPaymentMethodDerivedProps(
    props: HostedPaymentMethodProps,
): HostedPaymentMethodDerivedProps {
    const filterAccountInstruments = memoizeOne((instruments: PaymentInstrument[] = []) =>
        instruments.filter(isAccountInstrument),
    );
    const filterTrustedInstruments = memoizeOne((instruments: AccountInstrument[] = []) =>
        instruments.filter(({ trustedShippingAddress }) => trustedShippingAddress),
    );
    const { checkoutService, checkoutState, isUsingMultiShipping = false, method } = props;

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

    if (!config || !cart || !customer) {
        throw new Error('Unable to get checkout');
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
}

class HostedPaymentMethodComponent extends Component<
    HostedPaymentMethodProps,
    HostedPaymentMethodState
> {
    state: HostedPaymentMethodState = {
        isAddingNewInstrument: false,
    };

    async componentDidMount(): Promise<void> {
        const { initializePayment, method, onUnhandledError = noop } = this.props;

        const { isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp, loadInstruments } =
            getHostedPaymentMethodDerivedProps(this.props);

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
        const { description, isInitializing = false } = this.props;

        const {
            isLoadingInstruments,
            instruments,
            isNewAddress,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
        } = getHostedPaymentMethodDerivedProps(this.props);

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
                            instruments={instruments}
                            isAccountInstrument={true}
                        />
                    )}
                </div>
            </LoadingOverlay>
        );
    }

    private getDefaultInstrument(): AccountInstrument | undefined {
        const { isAddingNewInstrument } = this.state;

        const { instruments } = getHostedPaymentMethodDerivedProps(this.props);

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
        const { instruments } = getHostedPaymentMethodDerivedProps(this.props);

        this.setState({
            isAddingNewInstrument: false,
            selectedInstrument: find(instruments, { bigpayToken: id }),
        });
    };
}

export default HostedPaymentMethodComponent;
