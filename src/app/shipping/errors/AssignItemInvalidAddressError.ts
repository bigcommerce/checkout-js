import { setPrototypeOf, CustomError } from '../../common/error';
import { getLanguageService } from '../../locale';

const languageService = getLanguageService();

export class AssignItemInvalidAddressError extends CustomError {
    constructor(data?: Error) {
        super({
            name: 'ASSIGN_ITEM_INVALID_ADDRESS',
            message: languageService.translate('shipping.assign_item_invalid_address_error'),
            title: languageService.translate('shipping.assign_item_invalid_address_error_heading'),
            data,
        });

        setPrototypeOf(this, AssignItemInvalidAddressError.prototype);
    }
}
