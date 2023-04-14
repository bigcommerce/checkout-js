import LocaleContext from './LocaleContext';
import { createInjectHoc, InjectHoc } from './utils';

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
