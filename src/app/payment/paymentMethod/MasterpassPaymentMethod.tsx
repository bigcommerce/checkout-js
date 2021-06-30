import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, useMemo, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { getLanguageService, withLanguage, WithLanguageProps } from '../../locale';

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
        const supportedLocales: {[language: string]: string[]} = {es: ['es_es', 'es_mx', 'es_pe', 'es_co', 'es_ar', 'es_cl'],
            en: ['en_us', 'en_gb', 'en_ca', 'en_es', 'en_fr', 'en_ie', 'en_sg', 'en_au', 'en_nz', 'en_my', 'en_hk', 'en_th', 'en_ae', 'en_sa', 'en_qa', 'en_kw', 'en_za'],
            pt: ['pt_br'],
            zu: ['zu_za'],
            ar: ['ar_sa', 'ar_ae', 'ar_qa', 'ar_kw'],
            zh: ['zh_sg', 'zh_hk'],
            ms: ['ms_my'],
            uk: ['uk_ua'],
            sv: ['sv_se'],
            hr: ['hr_hr'],
            pl: ['pl_pl'],
            nl: ['nl_be'],
            it: ['it_it'],
            de: ['de_de'],
            fr: ['fr_fr', 'fr_ca']};
        let formatedLocale = localeLanguage.replace('-', '_').toLowerCase();
        const regex = formatedLocale.match(/^([a-z]{2})((?:\_)([a-z]{2}))?$/);
        if (regex && regex[3]) {
            if (regex[1] in supportedLocales) {
                formatedLocale = supportedLocales[regex[1]].includes(regex[0]) ? formatedLocale : supportedLocales[regex[1]][0];
            } else {
                formatedLocale = 'en_us';
            }
        } else if (regex) {
            formatedLocale = regex[1] in supportedLocales ? supportedLocales[regex[1]][0] : 'en_us';
        } else {
            formatedLocale = 'en_us';
        }

        return formatedLocale;
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
