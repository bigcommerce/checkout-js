import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { Omit } from 'utility-types';

import { masterpassFormatLocale, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';

import WalletButtonPaymentMethod, {
    WalletButtonPaymentMethodProps,
} from './WalletButtonPaymentMethod';

export type MasterpassPaymentMethodProps = Omit<WalletButtonPaymentMethodProps, 'buttonId'>;

interface WithCheckoutMasterpassProps {
    storeLanguage: string;
}

const MasterpassPaymentMethod: FunctionComponent<
    MasterpassPaymentMethodProps & WithLanguageProps & WithCheckoutMasterpassProps
> = ({ initializePayment, language, storeLanguage, ...rest }) => {
    const initializeMasterpassPayment = useCallback(
        (options: PaymentInitializeOptions) =>
            initializePayment({
                ...options,
                masterpass: {
                    walletButton: 'walletButton',
                },
            }),
        [initializePayment],
    );

    const {
        config: { testMode },
        initializationData: { checkoutId, isMasterpassSrcEnabled },
    } = rest.method;

    const locale = masterpassFormatLocale(storeLanguage);

    const signInButtonLabel = useMemo(
        () => (
            <img
                alt={language.translate('payment.masterpass_name_text')}
                id="mpbutton"
                src={
                    isMasterpassSrcEnabled
                        ? `https://${
                              testMode ? 'sandbox.' : ''
                          }src.mastercard.com/assets/img/btn/src_chk_btn_126x030px.svg?locale=${locale}&paymentmethod=master,visa,amex,discover&checkoutid=${checkoutId}`
                        : `https://masterpass.com/dyn/img/btn/global/mp_chk_btn_126x030px.svg`
                }
            />
        ),
        [checkoutId, language, locale, testMode, isMasterpassSrcEnabled],
    );

    return (
        <WalletButtonPaymentMethod
            {...rest}
            buttonId="walletButton"
            initializePayment={initializeMasterpassPayment}
            signInButtonLabel={signInButtonLabel}
        />
    );
};

function mapFromCheckoutProps({ checkoutState }: CheckoutContextProps) {
    const {
        data: { getConfig },
    } = checkoutState;
    const config = getConfig();

    if (!config) {
        return null;
    }

    return {
        storeLanguage: config.storeProfile.storeLanguage,
    };
}

export default withCheckout(mapFromCheckoutProps)(withLanguage(MasterpassPaymentMethod));
