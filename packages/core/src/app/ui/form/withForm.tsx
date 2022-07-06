import { createInjectHoc } from '../../common/hoc';

import { FormContext, FormContextType } from './FormProvider';

export type WithFormProps = FormContextType;

const withForm = createInjectHoc(FormContext, { displayNamePrefix: 'WithForm' });

export default withForm;
