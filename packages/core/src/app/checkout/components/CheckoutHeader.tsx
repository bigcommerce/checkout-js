import { type PaymentMethod } from '@bigcommerce/checkout-sdk/essential';
import React from 'react';

import { useCheckout, useExtensions } from '@bigcommerce/checkout/contexts';
import { LoadingNotification } from '@bigcommerce/checkout/ui';

import { EMPTY_ARRAY } from '../../common/utility';
import { CheckoutButtonContainer } from '../../customer';
import { PromotionBannerList } from '../../promotion';
import CheckoutStepType from '../CheckoutStepType';

import { BackorderQuantitiesChangedBanner } from './BackorderQuantitiesChangedBanner';

export interface CheckoutHeaderProps {
    activeStepType?: CheckoutStepType;
    defaultStepType?: CheckoutStepType;
    buttonConfigs: PaymentMethod[];
    checkEmbeddedSupport: (methodIds: string[]) => boolean;
    onUnhandledError: (error: Error) => void;
    onWalletButtonClick: (methodName: string) => void;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
    activeStepType,
    defaultStepType,
    buttonConfigs,
    checkEmbeddedSupport,
    onUnhandledError,
    onWalletButtonClick,
}) => {
    const {
        selectedState: { checkout, config, flashMessages },
    } = useCheckout(({ data }) => ({
        checkout: data.getCheckout(),
        config: data.getConfig(),
        flashMessages: data.getFlashMessages('warning'),
    }));
    const { extensionState } = useExtensions();

    const { promotions = EMPTY_ARRAY } = checkout || {};

    const isShowingWalletButtonsOnTop = Boolean(
        config?.checkoutSettings?.checkoutUserExperienceSettings?.walletButtonsOnTop,
    );

    const isPaymentStepActive = activeStepType
        ? activeStepType === CheckoutStepType.Payment
        : defaultStepType === CheckoutStepType.Payment;

    return (
        <>
            <BackorderQuantitiesChangedBanner message={flashMessages?.[0]?.message} />
            <LoadingNotification isLoading={extensionState.isShowingLoadingIndicator} />
            <PromotionBannerList promotions={promotions} />
            {isShowingWalletButtonsOnTop && buttonConfigs?.length > 0 && (
                <CheckoutButtonContainer
                    checkEmbeddedSupport={checkEmbeddedSupport}
                    isPaymentStepActive={isPaymentStepActive}
                    onUnhandledError={onUnhandledError}
                    onWalletButtonClick={onWalletButtonClick}
                />
            )}
        </>
    );
};

export default CheckoutHeader;
