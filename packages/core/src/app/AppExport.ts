import { InitializeLanguageService } from '@bigcommerce/checkout/locale';

import { RenderCheckout } from './checkout';
import { isRecord } from './common/utility';
import { RenderOrderConfirmation } from './order';

export default interface AppExport {
    renderCheckout: RenderCheckout;
    renderOrderConfirmation: RenderOrderConfirmation;
    initializeLanguageService: InitializeLanguageService;
}

export function isAppExport(appExport: unknown): appExport is AppExport {
    return (
        isRecord(appExport) &&
        'renderCheckout' in appExport &&
        typeof appExport.renderCheckout === 'function' &&
        'renderOrderConfirmation' in appExport &&
        typeof appExport.renderOrderConfirmation === 'function' &&
        'initializeLanguageService' in appExport &&
        typeof appExport.initializeLanguageService === 'function'
    );
}
