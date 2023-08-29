import { ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';

export default class NoopErrorLogger implements ErrorLogger {
    log() {}
}
