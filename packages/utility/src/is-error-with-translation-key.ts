export interface ErrorWithTranslationKey {
    translationKey: string;
}

export default function isErrorWithTranslationKey(
    error: unknown,
): error is ErrorWithTranslationKey {
    return typeof error === 'object' && error !== null && 'translationKey' in error;
}
