import HashStatic from 'object-hash';

export default function computeErrorCode(error: Error): string {
    return HashStatic(error).toUpperCase();
}
