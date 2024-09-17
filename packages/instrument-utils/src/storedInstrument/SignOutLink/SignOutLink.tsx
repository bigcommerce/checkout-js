import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString, useLocale } from '@bigcommerce/checkout/locale';
import { getPaymentMethodName } from '@bigcommerce/checkout/payment-integration-api';

export interface SignOutLinkProps {
    method: PaymentMethod;
    onSignOut(): void;
}

const SignOutLink: FunctionComponent<SignOutLinkProps> = ({ method, onSignOut }) => {
    const { language } = useLocale();

    return (
        <div className="signout-link">
            <TranslatedString id="remote.sign_out_before_action" />{' '}
            {
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a href="#" onClick={preventDefault(onSignOut)}>
                    <TranslatedString
                        data={{ providerName: getPaymentMethodName(language)(method) }}
                        id="remote.sign_out_action"
                    />
                </a>
            }{' '}
            <TranslatedString id="remote.sign_out_after_action" />
        </div>
    );
};

export default SignOutLink;
