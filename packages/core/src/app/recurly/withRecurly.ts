import { createInjectHoc, createMappableInjectHoc, InjectHoc } from '../common/hoc';

import RecurlyContext, { RecurlyContextProps } from './RecurlyContext';

const withRecurly = createMappableInjectHoc(RecurlyContext, {
    displayNamePrefix: 'WithRecurly',
});

export default withRecurly;
