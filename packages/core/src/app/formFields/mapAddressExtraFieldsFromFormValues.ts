import { B2B_EXTRA_FIELD_PREFIX } from '@bigcommerce/checkout-sdk/essential';

export default function mapAddressExtraFieldsFromFormValues(extraFields?: {
    [id: string]: any;
}): Array<{ fieldId: string; fieldValue: string | number }> | undefined {
    if (!extraFields) {
        return undefined;
    }

    return Object.entries(extraFields).map(([name, value]) => {
        return {
            // Form keys are prefixed with `B2B_EXTRA_FIELD_PREFIX`, but checkout state
            // stores `Address.extraFields[i].fieldId` as the raw id. Strip the prefix so
            // both round-trip to the same shape — otherwise `isEqualAddress` treats an
            // unchanged B2B address as different and refires update calls every step.
            fieldId: name.startsWith(B2B_EXTRA_FIELD_PREFIX)
                ? name.slice(B2B_EXTRA_FIELD_PREFIX.length)
                : name,
            fieldValue: value as string | number,
        };
    });
}
