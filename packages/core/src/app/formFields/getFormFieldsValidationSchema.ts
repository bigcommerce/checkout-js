import { memoize } from '@bigcommerce/memoize';
import { object, type ObjectSchema, string, type StringSchema } from 'yup';

import getCustomFormFieldsValidationSchema, {
  type FormFieldsValidationSchemaOptions,
} from './getCustomFormFieldsValidationSchema';

export const WHITELIST_REGEXP = /^[^<>]*$/;

export type FormFieldValues = Record<string, string | Record<string, any>>;

export default memoize(
  ({
    formFields,
    translate = () => undefined,
  }: FormFieldsValidationSchemaOptions): ObjectSchema<FormFieldValues> =>
    object({
      ...formFields
        .filter(({ custom }) => !custom)
        .reduce<Record<string, StringSchema>>((schema, { name, required, label, maxLength }) => {
          schema[name] = string();

          if (required) {
            schema[name] = schema[name].trim().required(translate('required', { label, name }));
          }

          if ((name === 'address1' || name === 'address2') && maxLength) {
            schema[name] = schema[name].max(
              maxLength,
              translate('max', { label, name, max: maxLength }),
            );
          }

          schema[name] = schema[name].matches(
            WHITELIST_REGEXP,
            translate('invalid', { name, label }),
          );

          return schema;
        }, {}),
    }).concat(
      getCustomFormFieldsValidationSchema({ formFields, translate }),
    ) as ObjectSchema<FormFieldValues>,
);
