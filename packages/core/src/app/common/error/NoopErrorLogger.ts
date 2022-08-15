import ErrorLogger from './ErrorLogger';

export default class NoopErrorLogger implements ErrorLogger {
    log() {}
}
