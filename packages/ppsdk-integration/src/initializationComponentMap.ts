import { type ComponentType } from 'react';

import { HostedCreditCardPaymentMethod } from '@bigcommerce/checkout/hosted-credit-card-integration';

import { NoUI } from './NoUI';

type ComponentMap = Record<string, ComponentType<any>>;

export const initializationComponentMap: ComponentMap = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    card_ui: HostedCreditCardPaymentMethod,
    none: NoUI,
};
