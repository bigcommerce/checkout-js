import { getLanguageService } from '@bigcommerce/checkout/locale';

import { CustomError, setPrototypeOf } from '../../common/error';

export default class UnassignItemError extends CustomError {
    constructor(data: Error) {
        super({
            name: 'UNASSIGN_ITEM_FAILED',
            message: getLanguageService().translate('shipping.unassign_item_error'),
            data,
        });

        setPrototypeOf(this, UnassignItemError.prototype);
    }
}
