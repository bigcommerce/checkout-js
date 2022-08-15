import HashStatic from 'object-hash';

export default function computeErrorCode(value: any): string | undefined {
    try {
        return HashStatic(value).toUpperCase();
    } catch (error) {}
}
