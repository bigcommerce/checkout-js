import { setPrototypeOf, CustomError } from '../../common/error';
import { getLanguageService } from '../../locale';

export default class ShippingOptionExpiredError extends CustomError {
    constructor() {
        super({
            name: 'SHIPPING_OPTION_EXPIRED',
            message: getLanguageService().translate('shipping.shipping_option_expired_error'),
            title: getLanguageService().translate('shipping.shipping_option_expired_heading'),
        });

        setPrototypeOf(this, ShippingOptionExpiredError.prototype);
    }
}
