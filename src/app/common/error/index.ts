import ErrorLogger from './ErrorLogger';
import { ErrorModalOnCloseProps, ErrorModalProps } from './ErrorModal';

export type ErrorLogger = ErrorLogger;
export type ErrorModalOnCloseProps = ErrorModalOnCloseProps;
export type ErrorModalProps = ErrorModalProps;

export { ErrorLevelType } from './ErrorLogger';
export { default as CustomError } from './CustomError';
export { default as ErrorCode } from './ErrorCode';
export { default as ErrorLoggingBoundary } from './ErrorLoggingBoundary';
export { default as ErrorModal } from './ErrorModal';
export { default as computeErrorCode } from './computeErrorCode';
export { default as createErrorLogger } from './createErrorLogger';
export { default as isCustomError } from './isCustomError';
export { default as isRequestError } from './isRequestError';
export { setPrototypeOf } from './createCustomErrorType';
