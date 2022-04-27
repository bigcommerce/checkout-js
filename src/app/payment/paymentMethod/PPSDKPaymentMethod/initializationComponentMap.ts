import { ComponentType } from 'react';

import HostedCreditCardPaymentMethod from '../HostedCreditCardPaymentMethod';

import { NoUI } from './NoUI';

type ComponentMap = Record<string, ComponentType<any>>;

export const initializationComponentMap: ComponentMap = {
    card_ui: HostedCreditCardPaymentMethod,
    none: NoUI,
};
