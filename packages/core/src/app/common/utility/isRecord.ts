export default function isRecord<TKey extends string, TValue>(
    record: unknown,
): record is Record<TKey, TValue> {
    return typeof record === 'object' && record !== null;
}
