import { CustomError } from "@bigcommerce/checkout/payment-integration-api";

export default function isHtmlError(error: Error): error is CustomError {

    return 'type' in error &&
        error.type === 'custom' &&
        'data' in error &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'shouldBeTranslatedAsHtml' in error.data &&
        typeof error.data.shouldBeTranslatedAsHtml === 'boolean';
}
