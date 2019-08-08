import { setPrototypeOf, CustomError } from '../../common/error';
import { getLanguageService } from '../../locale';

const languageService = getLanguageService();

export class AccountCreationFailedError extends CustomError {
    constructor(data: Error) {
        super({
            name: 'ACCOUNT_CREATION_FAILED',
            message: languageService.translate('customer.create_account_error'),
            data,
        });

        setPrototypeOf(this, AccountCreationFailedError.prototype);
    }
}
