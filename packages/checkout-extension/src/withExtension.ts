import { createInjectHoc } from '@bigcommerce/checkout/locale';

import { ExtensionContext } from './ExtensionContext';

export const withExtension = createInjectHoc(ExtensionContext, {
    displayNamePrefix: 'WithExtension',
});
