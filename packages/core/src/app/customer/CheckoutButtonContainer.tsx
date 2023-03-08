import { CustomerInitializeOptions, CustomerRequestOptions } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import { WalletButtonsContainerSkeleton } from '@bigcommerce/checkout/ui';

import { CheckoutContextProps, withCheckout } from '../checkout';
import { TranslatedString } from '../locale';

import CheckoutButtonListV1, { filterUnsupportedMethodIds } from './CheckoutButtonList';

interface CheckoutButtonContainerProps {
    checkEmbeddedSupport(methodIds: string[]): void;
    onUnhandledError(error: Error): void;
}

interface WithCheckoutCheckoutButtonContainerProps{
    availableMethodIds: string[];
    isLoading: boolean;
    initializedMethodIds: string[];
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
}

const sortMethodIds = (methodIds:string[]):string[] => {
    const order = ['applepay', 'braintreepaypalcredit', 'braintreepaypal'];

    return methodIds.sort((a, b) => order.indexOf(b) - order.indexOf(a));
}

const CheckoutButtonContainer: FunctionComponent<CheckoutButtonContainerProps & WithCheckoutCheckoutButtonContainerProps> = (
    {
        availableMethodIds,
        checkEmbeddedSupport,
        deinitialize,
        isLoading,
        initialize,
        initializedMethodIds,
        onUnhandledError,
    }) => {

    const methodIds = isLoading ? availableMethodIds : initializedMethodIds;

    try {
        checkEmbeddedSupport(methodIds);
    } catch (error) {
        return null;
    }

    return (
        <div className='checkout-button-container'>
            <p>
                <TranslatedString id="remote.start_with_text" />
            </p>
            <div className={classNames({
                'checkout-buttons--1': methodIds.length === 1,
                'checkout-buttons--2': methodIds.length === 2,
                'checkout-buttons--3': methodIds.length === 3,
                'checkout-buttons--4': methodIds.length === 4,
                'checkout-buttons--5': methodIds.length === 5,
                'checkout-buttons--n': methodIds.length > 5,
            })}>
                <WalletButtonsContainerSkeleton buttonsCount={methodIds.length} isLoading={isLoading}>
                    <CheckoutButtonListV1
                        checkEmbeddedSupport={checkEmbeddedSupport}
                        deinitialize={deinitialize}
                        hideText={true}
                        initialize={initialize}
                        isInitializing={isLoading}
                        isShowingWalletButtonsOnTop={true}
                        methodIds={sortMethodIds(methodIds)}
                        onError={onUnhandledError}
                    />
                </WalletButtonsContainerSkeleton>
            </div>
            <div className='checkout-separator'><span><TranslatedString id='remote.or_text' /></span></div>
        </div>
    );
};

function mapToCheckoutButtonContainerProps({
    checkoutState: {
       data: {
           getConfig,
       },
       statuses: {
           isInitializedCustomer,
       },
       errors: {
           getInitializeCustomerError,
       }
    },
    checkoutService,
}: CheckoutContextProps): WithCheckoutCheckoutButtonContainerProps | null {
    const config = getConfig();
    const availableMethodIds = filterUnsupportedMethodIds(config?.checkoutSettings.remoteCheckoutProviders ?? []);

    if (!config || availableMethodIds.length === 0) {
        return null;
    }

    const isLoading = availableMethodIds.filter(
        (methodId) => Boolean(getInitializeCustomerError(methodId)) || isInitializedCustomer(methodId)
    ).length !== availableMethodIds.length;
    const initializedMethodIds = availableMethodIds.filter((methodId) => isInitializedCustomer(methodId));

    return {
        availableMethodIds,
        deinitialize: checkoutService.deinitializeCustomer,
        initialize: checkoutService.initializeCustomer,
        initializedMethodIds,
        isLoading,
    }
}

export default withCheckout(mapToCheckoutButtonContainerProps)(CheckoutButtonContainer);
