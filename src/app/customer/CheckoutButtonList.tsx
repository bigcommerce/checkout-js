import { CustomerInitializeOptions, CustomerRequestOptions } from '@bigcommerce/checkout-sdk';
import React, { memo, Fragment, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';

import CheckoutButton from './CheckoutButton';

// TODO: The API should tell UI which payment method offers its own checkout button
export const SUPPORTED_METHODS: string[] = [
    'amazon',
    'braintreevisacheckout',
    'chasepay',
    'masterpass',
    'googlepayauthorizenet',
    'googlepaybraintree',
    'googlepaycheckoutcom',
    'googlepaystripe',
];

export interface CheckoutButtonListProps {
    methodIds: string[];
    checkEmbeddedSupport?(methodIds: string[]): void;
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
    onError?(error: Error): void;
}

const CheckoutButtonList: FunctionComponent<CheckoutButtonListProps> = ({
    checkEmbeddedSupport,
    onError,
    methodIds,
    ...rest
}) => {
    const supportedMethodIds = methodIds
        .filter(methodId => SUPPORTED_METHODS.indexOf(methodId) !== -1);

    if (supportedMethodIds.length === 0) {
        return null;
    }

    if (checkEmbeddedSupport) {
        try {
            checkEmbeddedSupport(supportedMethodIds);
        } catch (error) {
            if (onError) {
                onError(error);
            } else {
                throw error;
            }

            return null;
        }
    }

    return (
        <Fragment>
            <p><TranslatedString id="remote.continue_with_text" /></p>

            <div className="checkoutRemote">
                { supportedMethodIds.map(methodId =>
                    <CheckoutButton
                        containerId={ `${methodId}CheckoutButton` }
                        key={ methodId }
                        methodId={ methodId }
                        onError={ onError }
                        { ...rest }
                    />
                ) }
            </div>
        </Fragment>
    );
};

export default memo(CheckoutButtonList);
