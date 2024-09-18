import { getLanguageService } from '@bigcommerce/checkout/locale';

import { CustomError, setPrototypeOf } from '../../common/error';

export default class AssignItemFailedError extends CustomError {
    constructor(data: Error) {
        super({
            name: 'ASSIGN_ITEM_FAILED',
            message: getLanguageService().translate('shipping.assign_item_error'),
            data,
        });

        setPrototypeOf(this, AssignItemFailedError.prototype);
    }
}
