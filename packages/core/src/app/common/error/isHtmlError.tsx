import { CustomError, isCustomError } from './index';

export default function isHtmlError(error: Error): error is CustomError {

    return isCustomError(error) ? (
        error &&
        error.data &&
        typeof error.data.shouldBeTranslatedAsHtml === 'boolean' &&
        typeof error.data.translationKey === 'string'
    ): false;
}
