import { type CheckoutSelectors, type CheckoutService } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type FunctionComponent, lazy, memo, Suspense } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString, useLocale } from '@bigcommerce/checkout/locale';
import { type CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
import { WalletButtonsContainerSkeleton } from '@bigcommerce/checkout/ui';

import { withCheckout } from '../checkout';

import { getSupportedMethodIds } from './getSupportedMethods';
import resolveCheckoutButton from './resolveCheckoutButton';

const CheckoutButtonV1Resolver = lazy(() => import(/* webpackChunkName: "wallet-button-v1-resolver" */'./WalletButtonV1Resolver'));

interface CheckoutButtonContainerProps {
    isPaymentStepActive: boolean;
    checkEmbeddedSupport(methodIds: string[]): void;
    onUnhandledError(error: Error): void;
    onWalletButtonClick(methodId: string): void;
}

interface WithCheckoutCheckoutButtonContainerProps {
    availableMethodIds: string[];
    checkoutState: CheckoutSelectors;
    checkoutService: CheckoutService;
    isLoading: boolean;
}

const paypalCommerceIds = [
    'paypalcommerce',
    'paypalcommercecredit',
    'paypalcommercevenmo',
];

const isPayPalCommerce = (methodId: string): boolean => paypalCommerceIds.includes(methodId);

const CheckoutButtonContainer: FunctionComponent<CheckoutButtonContainerProps & WithCheckoutCheckoutButtonContainerProps> = (
    {
        availableMethodIds,
        checkoutService,
        checkoutState,
        checkEmbeddedSupport,
        isLoading,
        isPaymentStepActive,
        onUnhandledError,
        onWalletButtonClick,
    }) => {
    const { language } = useLocale();
    const { themeV2 } = useThemeContext();

    try {
        checkEmbeddedSupport(availableMethodIds);
    } catch (error) {
        return null;
    }

    const renderButtons = () => availableMethodIds.map((methodId) => {
        if (isPaymentStepActive && isPayPalCommerce(methodId)) {
            return null;
        }

        const ResolvedCheckoutButton = resolveCheckoutButton(
            { id: methodId },
        );

        if (!ResolvedCheckoutButton) {
            return <Suspense key={methodId}>
                <CheckoutButtonV1Resolver
                    deinitialize={checkoutService.deinitializeCustomer}
                    initialize={checkoutService.initializeCustomer}
                    isShowingWalletButtonsOnTop={true}
                    key={methodId}
                    methodId={methodId}
                    onClick={onWalletButtonClick}
                    onError={onUnhandledError}
                />
            </Suspense>
        }

        return <Suspense key={methodId}>
            <ResolvedCheckoutButton
                checkoutService={checkoutService}
                checkoutState={checkoutState}
                containerId={`${methodId}CheckoutButton`}
                language={language}
                methodId={methodId}
                onUnhandledError={onUnhandledError}
                onWalletButtonClick={onWalletButtonClick}
            />
        </Suspense>;
    });

    return (
        <div className='checkout-button-container'
             style={ isPaymentStepActive ? { position: 'absolute', left: '0', top: '-100%' } : undefined }
        >
            <p className={classNames({
                'sub-header': themeV2,
            })}>
                <TranslatedString id="remote.start_with_text" />
            </p>
            <div className='checkout-buttons-auto-layout'>
                <WalletButtonsContainerSkeleton buttonsCount={availableMethodIds.length} isLoading={isLoading}>
                    <div className="checkoutRemote">
                        {renderButtons()}
                    </div>
                </WalletButtonsContainerSkeleton>
            </div>
            <div className='checkout-separator'>
                <span className={classNames({ 'sub-header': themeV2 })}>
                    <TranslatedString id='remote.or_text' />
                </span>
            </div>
        </div>
    );
};

function mapToCheckoutButtonContainerProps({
    checkoutState,
    checkoutService,
}: CheckoutContextProps): WithCheckoutCheckoutButtonContainerProps | null {
    const {
        data: {
            getConfig,
            getCustomer,
            isPaymentDataRequired,
        },
        statuses: {
            isInitializedCustomer,
        },
        errors: {
            getInitializeCustomerError,
        }
     } = checkoutState;
    const config = getConfig();
    const providers = config?.checkoutSettings.remoteCheckoutProviders ?? [];

    const availableMethodIds = getSupportedMethodIds(providers);
    const customer = getCustomer();

    if (!isPaymentDataRequired()) {
        return null;
    }

    if (!config || availableMethodIds.length === 0 || !customer?.isGuest) {
        return null;
    }

    const isLoading = availableMethodIds.filter(
        (methodId) => Boolean(getInitializeCustomerError(methodId)) || isInitializedCustomer(methodId)
    ).length !== availableMethodIds.length;

    return {
        checkoutService,
        checkoutState,
        availableMethodIds,
        isLoading,
    }
}

export default memo(withCheckout(mapToCheckoutButtonContainerProps)(CheckoutButtonContainer));
