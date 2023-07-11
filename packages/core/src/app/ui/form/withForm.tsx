import { FormContext, FormContextType } from '@bigcommerce/checkout/ui';

import { createInjectHoc } from '../../common/hoc';


export type WithFormProps = FormContextType;

const withForm = createInjectHoc(FormContext, { displayNamePrefix: 'WithForm' });

export default withForm;
