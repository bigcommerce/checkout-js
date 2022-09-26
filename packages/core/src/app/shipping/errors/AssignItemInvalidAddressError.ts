import { CustomError, setPrototypeOf } from '../../common/error';
import { getLanguageService } from '../../locale';

export default class AssignItemInvalidAddressError extends CustomError {
    constructor(data?: Error) {
        super({
            name: 'ASSIGN_ITEM_INVALID_ADDRESS',
            message: getLanguageService().translate('shipping.assign_item_invalid_address_error'),
            title: getLanguageService().translate(
                'shipping.assign_item_invalid_address_error_heading',
            ),
            data,
        });

        setPrototypeOf(this, AssignItemInvalidAddressError.prototype);
    }
}
