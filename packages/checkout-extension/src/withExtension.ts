import { createInjectHoc } from '@bigcommerce/checkout/legacy-hoc';

import { ExtensionContext } from './ExtensionContext';

export const withExtension = createInjectHoc(ExtensionContext, {
    displayNamePrefix: 'WithExtension',
});
