import { getLanguageService } from '@bigcommerce/checkout/locale';

import { CustomError, setPrototypeOf } from '../../common/error';

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
