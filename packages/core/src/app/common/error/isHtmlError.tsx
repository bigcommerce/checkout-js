import { CustomError } from './index';

export default function isHtmlError(error: Error): error is CustomError {
    const customErrorData = getErrorData(error);

    return (
        customErrorData &&
        typeof customErrorData.shouldBeTranslatedAsHtml === 'boolean' &&
        typeof customErrorData.translationKey === 'string'
    )
}

const getErrorData = (error: any) => {
   return  error?.data !== undefined && error.data;
}

