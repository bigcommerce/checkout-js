import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, useMemo, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { withLanguage, WithLanguageProps } from '../../locale';

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

    const { config: { testMode }, initializationData: { checkoutId } } = rest.method;
    const locale = navigator.language.replace('-', '_');
    const signInButtonLabel = useMemo(() => (
        <img
            alt={ language.translate('payment.masterpass_name_text') }
            id="mpbutton"
            src={ `https://${testMode ? 'sandbox.' : ''}src.mastercard.com/assets/img/btn/src_chk_btn_126x030px.svg?locale=${locale}&paymentmethod=master,visa,amex,discover&checkoutid=${checkoutId}` }
        />
    ), [checkoutId, language, locale, testMode]);

    return <WalletButtonPaymentMethod
        { ...rest }
        buttonId="walletButton"
        initializePayment={ initializeMasterpassPayment }
        signInButtonLabel={ signInButtonLabel }
    />;
};

export default withLanguage(MasterpassPaymentMethod);
