import { getLanguageService } from '@bigcommerce/checkout/locale';

import { CustomError, setPrototypeOf } from '../../common/error';

export default class AccountCreationRequirementsError extends CustomError {
    constructor(data: Error, requirements: string) {
        super({
            name: 'ACCOUNT_CREATION_REQUIREMENTS_ERROR',
            message: requirements,
            title: getLanguageService().translate(
                'customer.create_account_requirements_error_heading',
            ),
            data,
        });

        setPrototypeOf(this, AccountCreationRequirementsError.prototype);
    }
}
