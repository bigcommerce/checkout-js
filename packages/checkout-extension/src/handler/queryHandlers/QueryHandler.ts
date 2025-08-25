import {
    type CheckoutService,
    type Extension,
    type ExtensionQueryMap,
} from '@bigcommerce/checkout-sdk';
import type React from 'react';

import { type ExtensionAction } from '../../ExtensionProvider';

export interface QueryHandlerProps {
    checkoutService: CheckoutService;
    dispatch: React.Dispatch<ExtensionAction>;
    extension: Extension;
}

export interface QueryHandler<T extends keyof ExtensionQueryMap> {
    queryType: T;
    handler: (query: ExtensionQueryMap[T]) => Promise<void>;
}
