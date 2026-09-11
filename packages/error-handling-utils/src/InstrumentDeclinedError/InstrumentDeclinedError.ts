import { getLanguageService } from '@bigcommerce/checkout/locale';
import { CustomError } from '@bigcommerce/checkout/payment-integration-api';

export default class InstrumentDeclinedError extends CustomError {
    constructor() {
        super({
            message: getLanguageService().translate('payment.errors.instrument_declined'),
            name: 'INSTRUMENT_DECLINED_ERROR',
        });

        Object.setPrototypeOf(this, InstrumentDeclinedError.prototype);
    }
}
