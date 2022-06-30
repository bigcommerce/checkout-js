import { CustomerInitializeOptions, CheckoutSelectors, CustomerRequestOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React from 'react';
import { CheckoutContextProps, withCheckout } from '../checkout';
import CheckoutButtonList from '../customer/CheckoutButtonList';

interface ButtonWrapperProps {
    checkEmbeddedSupport(methodIds: string[]): void;
    onUnhandledError?(error: Error): void;
}

interface WithButtonWrapperProps {
    checkoutButtonIds: string[];
    isInitializing: boolean;
    providerWithCustomCheckout?: string;
    initializeCustomer(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>; 
}

function ButtonWrapper({
    checkoutButtonIds,
    isInitializing,
    checkEmbeddedSupport,
    onUnhandledError = noop,
    initializeCustomer,
    deinitializeCustomer
}: ButtonWrapperProps & WithButtonWrapperProps) {
    return (
        <>
            {/* <div className='wallet-button-header'>Express checkout</div> */}
            <div className='wallet-button-container'>
                <CheckoutButtonList
                    checkEmbeddedSupport={ checkEmbeddedSupport }
                    deinitialize={ deinitializeCustomer }
                    initialize={ initializeCustomer }
                    isInitializing={ isInitializing }
                    methodIds={ checkoutButtonIds }
                    onError={ onUnhandledError }
                />
            </div>
            <div className='or-normal'><span>OR</span></div>
        </>
    );
}

export function mapToButtonComponentProps(
    { checkoutService, checkoutState }: CheckoutContextProps
): WithButtonWrapperProps {
    const {
        data: { getConfig },
        statuses: { isInitializingCustomer },
    } = checkoutState;

    const config = getConfig();

    return {
        checkoutButtonIds: config?.checkoutSettings.remoteCheckoutProviders as string[],
        deinitializeCustomer: checkoutService.deinitializeCustomer,
        initializeCustomer: checkoutService.initializeCustomer,
        isInitializing: isInitializingCustomer(),
        providerWithCustomCheckout: config?.checkoutSettings.providerWithCustomCheckout || undefined,
    }
}

export default withCheckout(mapToButtonComponentProps)(ButtonWrapper);
