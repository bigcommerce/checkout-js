// import { FormField, LanguageService } from '@bigcommerce/checkout-sdk';
// import { memoize } from '@bigcommerce/memoize';
// import { object, StringSchema } from 'yup';
//
// export default memoize(function getPaypalCommerceRatePayValidationSchema({
//     formFieldData,
//     language,
// }: {
//     formFieldData: FormField[];
//     language: LanguageService;
// }) {
//     return object(
//         formFieldData.reduce((schema, { id, required }) => {
//             if (required) {
//                 if (id === 'ratepay_phone_country_code') {
//                     schema[id] = schema[id]
//                         .matches(
//                             /^\d{2}$/,
//                             language.translate('payment.ratepay.errors.isInvalid', {
//                                 label: language.translate('payment.ratepay.phone_country_code'),
//                             }),
//                         )
//                     }
//             }
//
//             return schema;
//         }, {} as { [key: string]: StringSchema }),
//     );
// });
