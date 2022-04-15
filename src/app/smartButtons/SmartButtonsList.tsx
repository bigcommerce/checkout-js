import { CheckoutButtonInitializeOptions, CheckoutButtonMethodType, CheckoutButtonOptions } from '@bigcommerce/checkout-sdk';

import React, { FunctionComponent } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';

import SmartButton from './SmartButton';

export interface WithCheckoutSmartButtonsProps {
    smartButtonProviders: SmartButtonProvider[];
    isInitializing?: boolean;
    deinitializeSmartButton(options: CheckoutButtonOptions): void;
    initializeSmartButton(options: CheckoutButtonInitializeOptions): void;
}

export interface SmartButtonProvider {
    gatewayId?: string;
    methodId: CheckoutButtonMethodType;
    sortOrder: number;
    initializationOptions?: {
        style?: any;
        // ...other
    };
}

export type SmartButtonsListProps= WithCheckoutSmartButtonsProps;

const SmartButtonsList: FunctionComponent<SmartButtonsListProps> | null = ({
    isInitializing,
    smartButtonProviders,
    ...rest
}) => {
    if (!smartButtonProviders?.length) {
        return null;
    }

    const sortedSmartButtonsProviders = smartButtonProviders.sort((current, next) => current.sortOrder - next.sortOrder);

    return (
        <>
            { !isInitializing && <h2>Smart buttons / External checkout</h2> }

            <ul className="smartButtonsList">
                { sortedSmartButtonsProviders.map((smartButtonProvider, index) => {
                    const { methodId } = smartButtonProvider;

                    return <SmartButton
                        containerId={ `${methodId}SmartButton` }
                        key={ index }
                        smartButtonProvider={ smartButtonProvider }
                        { ...rest }
                    />;
                }) }
            </ul>
        </>
    );
};

export function mapToWithCheckoutCustomerProps(
    { checkoutService, checkoutState }: CheckoutContextProps
): WithCheckoutSmartButtonsProps | null {
    const {
        data: { getCheckout, getConfig },
        statuses: { isInitializingCheckoutButton },
    } = checkoutState;

    const checkout = getCheckout();
    const config = getConfig();

    if (!checkout || !config) {
        return null;
    }

    const methodId = 'braintreepaypal' as CheckoutButtonMethodType.BRAINTREE_PAYPAL;

    const smartButtonProviders = config.checkoutSettings.smartButtonsProviders || [
        {
            gatewayId: null,
            methodId,
            sortOrder: 0,
            initializationOptions: {
                style: {},
            },
        },
    ];

    return {
        deinitializeSmartButton: checkoutService.deinitializeSmartButton,
        initializeSmartButton: checkoutService.initializeSmartButton,
        isInitializing:  isInitializingCheckoutButton(), // Info: we might use this variable in the future
        smartButtonProviders,
    };
}

export default withCheckout(mapToWithCheckoutCustomerProps)(SmartButtonsList);
