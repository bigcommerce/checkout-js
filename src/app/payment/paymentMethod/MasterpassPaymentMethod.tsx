import React, { FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { withLanguage, WithLanguageProps } from '../../locale';

import WalletButtonPaymentMethod, { WalletButtonPaymentMethodProps } from './WalletButtonPaymentMethod';

export type MasterpassPaymentMethodProps = Omit<WalletButtonPaymentMethodProps, 'buttonId'>;

const MasterpassPaymentMethod: FunctionComponent<MasterpassPaymentMethodProps & WithLanguageProps> = ({
    initializePayment,
    language,
    ...rest
}) => (
    <WalletButtonPaymentMethod
        { ...rest }
        buttonId="walletButton"
        initializePayment={ options => initializePayment({
            ...options,
            masterpass: {
                walletButton: 'walletButton',
            },
        }) }
        signInButtonLabel={ <img
            id="mpbutton"
            alt={ language.translate('payment.masterpass_name_text') }
            src="https://masterpass.com/dyn/img/btn/global/mp_chk_btn_126x030px.svg"
        /> }
    />
);

export default withLanguage(MasterpassPaymentMethod);
