import { type FormikContextType } from 'formik';

export default interface ConnectFormikProps<TValues> {
    formik: FormikContextType<TValues>;
}

export type WithFormikProps<TValues> = ConnectFormikProps<TValues>;
