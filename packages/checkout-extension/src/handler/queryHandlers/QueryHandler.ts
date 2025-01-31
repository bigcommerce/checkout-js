import { CheckoutService, Extension, ExtensionQueryMap } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { ExtensionAction } from '../../ExtensionProvider';

export interface QueryHandlerProps {
    checkoutService: CheckoutService;
    dispatch: React.Dispatch<ExtensionAction>;
    extension: Extension;
}

export interface QueryHandler<T extends keyof ExtensionQueryMap> {
    queryType: T;
    handler: (query: ExtensionQueryMap[T]) => Promise<void>;
}
