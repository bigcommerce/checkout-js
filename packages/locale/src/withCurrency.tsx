import { CurrencyService } from '@bigcommerce/checkout-sdk';

import { createInjectHoc, InjectHoc } from '@bigcommerce/checkout/legacy-hoc';

import LocaleContext from './LocaleContext';

export interface WithCurrencyProps {
    currency: CurrencyService;
}

const withCurrency: InjectHoc<WithCurrencyProps> = createInjectHoc(LocaleContext, {
    displayNamePrefix: 'WithCurrency',
    pickProps: (value, key) => key === 'currency' && !!value,
});

export default withCurrency;
