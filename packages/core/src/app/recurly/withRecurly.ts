import { createInjectHoc, createMappableInjectHoc, InjectHoc } from '@bigcommerce/checkout/legacy-hoc';

import RecurlyContext, { RecurlyContextProps } from './RecurlyContext';

const withRecurly = createMappableInjectHoc(RecurlyContext, {
    displayNamePrefix: 'WithRecurly',
});

export default withRecurly;
