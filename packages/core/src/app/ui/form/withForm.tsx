import { createInjectHoc } from '@bigcommerce/checkout/legacy-hoc';
import { FormContext, FormContextType } from '@bigcommerce/checkout/ui';

export type WithFormProps = FormContextType;

const withForm = createInjectHoc(FormContext, { displayNamePrefix: 'WithForm' });

export default withForm;
