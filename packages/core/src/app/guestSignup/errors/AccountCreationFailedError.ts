import { getLanguageService } from '@bigcommerce/checkout/locale';

import { CustomError, setPrototypeOf } from '../../common/error';

export default class AccountCreationFailedError extends CustomError {
    constructor(data: Error) {
        super({
            name: 'ACCOUNT_CREATION_FAILED',
            message: getLanguageService().translate('customer.create_account_error'),
            data,
        });

        setPrototypeOf(this, AccountCreationFailedError.prototype);
    }
}
