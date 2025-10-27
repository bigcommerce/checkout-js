import { type CurrencyService } from '@bigcommerce/checkout-sdk';

import { LocaleContext } from '@bigcommerce/checkout/contexts';
import { createInjectHoc, type InjectHoc } from '@bigcommerce/checkout/legacy-hoc';

export interface WithCurrencyProps {
    currency: CurrencyService;
}

const withCurrency: InjectHoc<WithCurrencyProps> = createInjectHoc(LocaleContext, {
    displayNamePrefix: 'WithCurrency',
    pickProps: (value, key) => key === 'currency' && !!value,
});

export default withCurrency;
