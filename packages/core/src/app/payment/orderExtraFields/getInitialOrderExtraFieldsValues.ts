import { type FormField } from '@bigcommerce/checkout-sdk/essential';

export default function getInitialOrderExtraFieldsValues(
    orderExtraFields: FormField[] | undefined,
    storedOrderExtraFields: Record<string, unknown> | undefined,
): Record<string, string | number> {
    return (orderExtraFields ?? []).reduce<Record<string, string | number>>((acc, field) => {
        const raw = storedOrderExtraFields?.[field.name];

        acc[field.name] =
            typeof raw === 'string' || typeof raw === 'number' ? raw : (field.default ?? '');

        return acc;
    }, {});
}
