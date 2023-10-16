import { CustomError } from './index';

export default function isHtmlError(error: CustomError): error is CustomError {

    return (
        error &&
        error.data &&
        typeof error.data.shouldBeTranslatedAsHtml === 'boolean' &&
        typeof error.data.translationKey === 'string'
    );
}
