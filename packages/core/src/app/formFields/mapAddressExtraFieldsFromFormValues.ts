export default function mapAddressExtraFieldsFromFormValues(
    extraFields?: { [id: string]: any },
): Array<{ fieldId: string; fieldValue: string | number }> | undefined {
    if (!extraFields) {
        return undefined;
    }

    return Object.entries(extraFields).map(([name, value]) => {
        return {
            fieldId: name,
            fieldValue: value as string | number,
        };
    });
}
