import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { type ReactNode } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString, useLocale } from '@bigcommerce/checkout/locale';
import { getPaymentMethodName } from '@bigcommerce/checkout/payment-integration-api';

export interface SignInViewProps {
    buttonId: string;
    method: PaymentMethod;
    signInButtonClassName?: string;
    signInButtonLabel?: ReactNode;
}

const SignInView: React.FC<SignInViewProps> = ({
    buttonId,
    method,
    signInButtonClassName,
    signInButtonLabel,
}) => {
    const { language } = useLocale();

    return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a className={signInButtonClassName} href="#" id={buttonId} onClick={preventDefault()}>
            {signInButtonLabel || (
                <TranslatedString
                    data={{ providerName: getPaymentMethodName(language)(method) }}
                    id="remote.sign_in_action"
                />
            )}
        </a>
    );
};

export default SignInView;
