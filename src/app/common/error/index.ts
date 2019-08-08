import { ErrorModalOnCloseProps, ErrorModalProps } from './errorModal/ErrorModal';
import { default as ErrorLogger } from './logger/ErrorLogger';

export type ErrorLogger = ErrorLogger;
export type ErrorModalOnCloseProps = ErrorModalOnCloseProps;
export type ErrorModalProps = ErrorModalProps;

export { default as ErrorCode } from './errorCode/ErrorCode';
export { ErrorLevelType } from './logger/ErrorLogger';
export { default as ErrorLoggerFactory } from './logger/ErrorLoggerFactory';
export { default as ErrorLoggingBoundary } from './logger/ErrorLoggingBoundary';
export { default as computeErrorCode } from './errorCode/computeErrorCode';
export { default as createCustomErrorType, setPrototypeOf } from './customError/createCustomErrorType';
export { default as CustomError } from './customError/CustomError';
export { default as ErrorModal } from './errorModal/ErrorModal';
