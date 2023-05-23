import { CustomerInitializeOptions, CustomerRequestOptions } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
import { WalletButtonsContainerSkeleton } from '@bigcommerce/checkout/ui';


import { withCheckout } from '../checkout';

import CheckoutButtonListV2 from './CheckoutButtonListV2';
import { getSupportedMethodIds } from './getSupportedMethods';
import resolveCheckoutButton from './resolveCheckoutButton';
import CheckoutButtonV1Resolver from './WalletButtonV1Resolver';

interface CheckoutButtonContainerProps {
    isPaymentStepActive: boolean;
    checkEmbeddedSupport(methodIds: string[]): void;
    onUnhandledError(error: Error): void;
}

interface WithCheckoutCheckoutButtonContainerProps{
    availableMethodIds: string[];
    isLoading: boolean;
    isPaypalCommerce: boolean;
    initializedMethodIds: string[];
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
}

const sortMethodIds = (methodIds:string[]): string[] => {
    const order = [
        'applepay',
        'braintreepaypalcredit',
        'braintreepaypal',
        'paypalcommercevenmo',
        'paypalcommercecredit',
        'paypalcommerce',
    ];

    return methodIds.sort((a, b) => order.indexOf(b) - order.indexOf(a));
}

const CheckoutButtonContainer: FunctionComponent<CheckoutButtonContainerProps & WithCheckoutCheckoutButtonContainerProps> = (
    {
        availableMethodIds,
        checkEmbeddedSupport,
        deinitialize,
        initialize,
        isLoading,
        isPaypalCommerce,
        isPaymentStepActive,
        initializedMethodIds,
        onUnhandledError,
    }) => {

    const methodIds = isLoading ? availableMethodIds : initializedMethodIds;

    try {
        checkEmbeddedSupport(methodIds);
    } catch (error) {
        return null;
    }

    if (isPaypalCommerce && isPaymentStepActive) {
        return null;
    }

    const buttons = availableMethodIds.map((methodId) => {
        const ResolvedCheckoutButton = resolveCheckoutButton({ id: methodId });

        if (!ResolvedCheckoutButton) {
            return {
                methodId,
                type: 'V1',
                component: 
                    <CheckoutButtonV1Resolver
                        deinitialize={deinitialize}
                        initialize={initialize}
                        isShowingWalletButtonsOnTop={true}
                        key={methodId}
                        methodId={methodId}
                        onError={onUnhandledError} />
                }
        }

        return { methodId, type: 'V1', component: ResolvedCheckoutButton };
    });

    return (
        <div className='checkout-button-container'
             style={ isPaymentStepActive ? { position: 'absolute', left: '0', top: '-100%' } : undefined }
        >
            <p>
                <TranslatedString id="remote.start_with_text" />
            </p>
            <div className={classNames({
                'checkout-buttons--1': buttons.length === 1,
                'checkout-buttons--2': buttons.length === 2,
                'checkout-buttons--3': buttons.length === 3,
                'checkout-buttons--4': buttons.length === 4,
                'checkout-buttons--5': buttons.length === 5,
                'checkout-buttons--n': buttons.length > 5,
            })}>
                <WalletButtonsContainerSkeleton buttonsCount={buttons.length} isLoading={isLoading}>
                    <CheckoutButtonListV2
                        buttons={buttons}
                        onUnhandledError={onUnhandledError}/>
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
           getCustomer,
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
    const availableMethodIds = getSupportedMethodIds(config?.checkoutSettings.remoteCheckoutProviders ?? []);
    const customer = getCustomer();

    if (!config || availableMethodIds.length === 0 || !customer?.isGuest) {
        return null;
    }

    const isLoading = availableMethodIds.filter(
        (methodId) => Boolean(getInitializeCustomerError(methodId)) || isInitializedCustomer(methodId)
    ).length !== availableMethodIds.length;
    const initializedMethodIds = availableMethodIds.filter((methodId) => isInitializedCustomer(methodId));
    const paypalCommerceIds = ['paypalcommerce', 'paypalcommercecredit', 'paypalcommercevenmo'];
    const isPaypalCommerce = availableMethodIds.some(id => paypalCommerceIds.includes(id));

    return {
        availableMethodIds: sortMethodIds(availableMethodIds),
        deinitialize: checkoutService.deinitializeCustomer,
        initialize: checkoutService.initializeCustomer,
        initializedMethodIds,
        isLoading,
        isPaypalCommerce,
    }
}

export default withCheckout(mapToCheckoutButtonContainerProps)(CheckoutButtonContainer);
