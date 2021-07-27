import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, useMemo, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { getLanguageService, masterpassFormatLocale, withLanguage, WithLanguageProps } from '../../locale';

import WalletButtonPaymentMethod, { WalletButtonPaymentMethodProps } from './WalletButtonPaymentMethod';

export type MasterpassPaymentMethodProps = Omit<WalletButtonPaymentMethodProps, 'buttonId'>;

const MasterpassPaymentMethod: FunctionComponent<MasterpassPaymentMethodProps & WithLanguageProps> = ({
    initializePayment,
    language,
    ...rest
}) => {
    const initializeMasterpassPayment = useCallback((options: PaymentInitializeOptions) => initializePayment({
        ...options,
        masterpass: {
            walletButton: 'walletButton',
        },
    }), [initializePayment]);

    const formatLocale = useCallback((localeLanguage: string) => {
        return masterpassFormatLocale(localeLanguage);
    }, []);

    const { config: { testMode }, initializationData: { checkoutId, isMasterpassSrcEnabled } } = rest.method;

    const locale = formatLocale(getLanguageService().getLocale());

    const signInButtonLabel = useMemo(() => (
        <img
            alt={ language.translate('payment.masterpass_name_text') }
            id="mpbutton"
            src={ isMasterpassSrcEnabled ?
                `https://${testMode ? 'sandbox.' : ''}src.mastercard.com/assets/img/btn/src_chk_btn_126x030px.svg?locale=${locale}&paymentmethod=master,visa,amex,discover&checkoutid=${checkoutId}` :
                `https://masterpass.com/dyn/img/btn/global/mp_chk_btn_126x030px.svg` }
        />
    ), [checkoutId, language, locale, testMode, isMasterpassSrcEnabled]);

    return <WalletButtonPaymentMethod
        { ...rest }
        buttonId="walletButton"
        initializePayment={ initializeMasterpassPayment }
        signInButtonLabel={ signInButtonLabel }
    />;
};

export default withLanguage(MasterpassPaymentMethod);
