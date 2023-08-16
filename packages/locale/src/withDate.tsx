import LocaleContext from './LocaleContext';
import { createInjectHoc, InjectHoc } from '@bigcommerce/checkout/legacy-hoc';

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
