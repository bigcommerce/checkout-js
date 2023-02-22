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
    const [isLoading, setIsLoading] = useState(true);

    const {
        data: {
            getConfig,
        },
        statuses: {
            isInitializingCustomer,
        },
    } = checkoutState;
    const config = getConfig();
    const methodIds = config?.checkoutSettings.remoteCheckoutProviders ?? [];

    useEffect(() => {
        const changeState = setTimeout(()=>{
            if(!isInitializingCustomer()) {
                setIsLoading(false);
            }
        },100);

        return () => {
            clearTimeout(changeState);
            setIsLoading(true);
        }
    }, [isInitializingCustomer]);

    if (!config || methodIds.length === 0) {
        return null;
    }

    const supportedMethodIds = sortMethodIds(filterUnsupportedMethodIds(methodIds));
    const buttonsCount = supportedMethodIds.length;

    if (buttonsCount < 1) {
        return null;
    }

    try {
        checkEmbeddedSupport(supportedMethodIds);
    } catch (error) {
        return null;
    }

    return (
        <div className='checkout-buttons-container'>
            <p>
                <TranslatedString id="remote.start_with_text" />
            </p>
            <div className={classNames({
                'checkout-buttons--1': buttonsCount === 1,
                'checkout-buttons--2': buttonsCount === 2,
                'checkout-buttons--3': buttonsCount === 3,
                'checkout-buttons--4': buttonsCount === 4,
                'checkout-buttons--5': buttonsCount === 5,
                'checkout-buttons--n': buttonsCount > 5,
            })}>
                <WalletButtonsContainerSkeleton buttonsCount={buttonsCount} isLoading={isLoading}>
                    <CheckoutButtonListV1
                        checkEmbeddedSupport={checkEmbeddedSupport}
                        deinitialize={checkoutService.deinitializeCustomer}
                        hideText={true}
                        initialize={checkoutService.initializeCustomer}
                        isInitializing={isLoading}
                        methodIds={supportedMethodIds}
                        onError={onUnhandledError}
                    />
                </WalletButtonsContainerSkeleton>
            </div>
            <div className='checkout-separator'><span><TranslatedString id='remote.or_text' /></span></div>
        </div>
    );
};

export default withCheckout((props) => props)(CheckoutButtonContainer);
