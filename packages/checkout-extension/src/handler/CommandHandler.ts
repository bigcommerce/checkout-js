import { CheckoutService, Extension } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { ExtensionAction } from '../ExtensionProvider';

export interface HandlerProps {
    checkoutService: CheckoutService;
    dispatch: React.Dispatch<ExtensionAction>;
    extension: Extension;
}

export type CommandHandler = (props: HandlerProps) => () => void;
