import isRecord from './isRecord';

export default function isRecordContainingKey<TKey extends string, TValue>(
    record: unknown,
    key: TKey,
): record is Record<TKey, TValue> {
    return isRecord(record) && key in record;
}
