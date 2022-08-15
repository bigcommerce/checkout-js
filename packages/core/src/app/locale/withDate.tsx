import { createInjectHoc, InjectHoc } from '../common/hoc';

import LocaleContext from './LocaleContext';

export interface WithDateProps {
    date: {
        inputFormat: string;
    };
}

const withDate: InjectHoc<WithDateProps> = createInjectHoc(LocaleContext, {
    displayNamePrefix: 'withDate',
    pickProps: (value, key) => key === 'date' && !!value,
});

export default withDate;
