import {
    type CheckoutService,
    type Extension,
    type ExtensionCommandMap,
} from '@bigcommerce/checkout-sdk';
import type React from 'react';

import { type ExtensionAction } from '../../ExtensionProvider';

export interface CommandHandlerProps {
    checkoutService: CheckoutService;
    dispatch: React.Dispatch<ExtensionAction>;
    extension: Extension;
}

export interface CommandHandler<T extends keyof ExtensionCommandMap> {
    commandType: T;
    handler: (command: ExtensionCommandMap[T]) => Promise<void> | void;
}
