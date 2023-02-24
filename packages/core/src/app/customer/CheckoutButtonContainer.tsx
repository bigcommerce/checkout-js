import classNames from 'classnames';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { WalletButtonsContainerSkeleton } from '@bigcommerce/checkout/ui';

import { CheckoutContextProps, withCheckout } from '../checkout';
import { TranslatedString } from '../locale';

import CheckoutButtonListV1, { filterUnsupportedMethodIds } from './CheckoutButtonList';

interface CheckoutButtonsListOnTopProps {
    checkEmbeddedSupport(methodIds: string[]): void;
    onUnhandledError(error: Error): void;
}

const sortMethodIds = (methodIds:string[]):string[] => {
    const order = ['applepay', 'braintreepaypalcredit', 'braintreepaypal'];

    return methodIds.sort((a, b) => order.indexOf(b) - order.indexOf(a));
}

const CheckoutButtonContainer: FunctionComponent<CheckoutButtonsListOnTopProps & CheckoutContextProps> = (
    {
        checkEmbeddedSupport,
        checkoutState,
        checkoutService,
        onUnhandledError,
    }) => {

    const {
        data: {
            getConfig,
        },
        statuses: {
            isInitializedCustomer,
        },
        errors: {
            getInitializeCustomerError,
        }
    } = checkoutState;
    const config = getConfig();
    const [methodIds, setMethodIds] = useState(filterUnsupportedMethodIds(config?.checkoutSettings.remoteCheckoutProviders ?? []));
    const isLoading = methodIds.filter(
        (methodId) => Boolean(getInitializeCustomerError(methodId)) || isInitializedCustomer(methodId)
    ).length !== methodIds.length;

    useEffect(() => {
        if(!isLoading){
            const initializedMethodIds = methodIds.filter((methodId) => isInitializedCustomer(methodId));

            setMethodIds(initializedMethodIds);
        }
    }, [isLoading]);

    if (!config || methodIds.length === 0) {
        return null;
    }

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
                        deinitialize={checkoutService.deinitializeCustomer}
                        hideText={true}
                        initialize={checkoutService.initializeCustomer}
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

export default withCheckout((props) => props)(CheckoutButtonContainer);
