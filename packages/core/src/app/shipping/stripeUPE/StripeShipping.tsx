import { Address, CheckoutSelectors, Consignment, Country, Customer, FormField, ShippingInitializeOptions, ShippingRequestOptions } from '@bigcommerce/checkout-sdk';
import React, { Component, ReactNode } from 'react';

import { AddressFormSkeleton } from '@bigcommerce/checkout/ui';

import CheckoutStepStatus from '../../checkout/CheckoutStepStatus';
import ShippingHeader from '../ShippingHeader';

import StripeShippingForm, { SingleShippingFormValues } from './StripeShippingForm';

export interface StripeShippingProps {
    isBillingSameAsShipping: boolean;
    cartHasChanged: boolean;
    isMultiShippingMode: boolean;
    step: CheckoutStepStatus;
    consignments: Consignment[];
    countries: Country[];
    customer: Customer;
    customerMessage: string;
    isGuest: boolean;
    isInitializing: boolean;
    isLoading: boolean;
    isShippingMethodLoading: boolean;
    isShippingStepPending: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowAddAddressInCheckout: boolean;
    shouldShowMultiShipping: boolean;
    shouldShowOrderComments: boolean;
    onReady?(): void;
    onUnhandledError(error: Error): void;
    onSubmit(values: SingleShippingFormValues): void;
    onMultiShippingChange(): void;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    loadShippingAddressFields(): Promise<CheckoutSelectors>;
    loadShippingOptions(): Promise<CheckoutSelectors>;
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
    getFields(countryCode?: string): FormField[];
}

interface StripeShippingState {
    isStripeLoading: boolean;
    isStripeAutoStep: boolean;
}

class StripeShipping extends Component<StripeShippingProps, StripeShippingState> {
    constructor(props: StripeShippingProps) {
        super(props);

        this.state = {
            isStripeLoading: true,
            isStripeAutoStep: false,
        };
    }

    render(): ReactNode {
        const {
            isBillingSameAsShipping,
            isGuest,
            shouldShowMultiShipping,
            customer,
            updateAddress,
            initialize,
            deinitialize,
            isMultiShippingMode,
            step,
            onSubmit,
            onMultiShippingChange,
            isLoading,
            isShippingMethodLoading,
            ...shippingFormProps
        } = this.props;

        const {
            isStripeLoading,
            isStripeAutoStep,
        } = this.state;

        return <>
            <AddressFormSkeleton isLoading={isStripeAutoStep || isStripeLoading}/>
            <div className="checkout-form" style={{display: isStripeAutoStep || isStripeLoading ? 'none' : undefined}}>
                <ShippingHeader
                    isGuest={isGuest}
                    isMultiShippingMode={isMultiShippingMode}
                    onMultiShippingChange={onMultiShippingChange}
                    shouldShowMultiShipping={shouldShowMultiShipping}
                />
                <StripeShippingForm
                    {...shippingFormProps}
                    deinitialize={deinitialize}
                    initialize={initialize}
                    isBillingSameAsShipping={isBillingSameAsShipping}
                    isLoading={isLoading}
                    isMultiShippingMode={isMultiShippingMode}
                    isShippingMethodLoading={isShippingMethodLoading}
                    isStripeAutoStep={this.handleIsAutoStep}
                    isStripeLoading={this.stripeLoadedCallback}
                    onSubmit={onSubmit}
                    step={step}
                    updateAddress={updateAddress}
                />
            </div>
        </>;
    }

    private stripeLoadedCallback: () => void = () => {
        this.setState({ isStripeLoading: false });
    }

    private handleIsAutoStep: () => void = () => {
        this.setState({ isStripeAutoStep: true });
    }
}

export default StripeShipping;
