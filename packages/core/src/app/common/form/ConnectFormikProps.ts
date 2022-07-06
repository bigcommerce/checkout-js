import { FormikContext } from 'formik';

export default interface ConnectFormikProps<TValues> {
    formik: FormikContext<TValues>;
}

export type WithFormikProps<TValues> = ConnectFormikProps<TValues>;
