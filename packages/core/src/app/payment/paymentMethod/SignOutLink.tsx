import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';

import getPaymentMethodName from './getPaymentMethodName';

export interface SignOutLinkProps {
    method: PaymentMethod;
    onSignOut(): void;
}

const SignOutLink: FunctionComponent<SignOutLinkProps & WithLanguageProps> = ({
    language,
    method,
    onSignOut,
}) => (
    <div className="signout-link">
        <TranslatedString id="remote.sign_out_before_action" />{' '}
        <a href="#" onClick={preventDefault(onSignOut)}>
            <TranslatedString
                data={{ providerName: getPaymentMethodName(language)(method) }}
                id="remote.sign_out_action"
            />
        </a>{' '}
        <TranslatedString id="remote.sign_out_after_action" />
    </div>
);

export default withLanguage(SignOutLink);
