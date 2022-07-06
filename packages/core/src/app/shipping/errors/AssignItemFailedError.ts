import { setPrototypeOf, CustomError } from '../../common/error';
import { getLanguageService } from '../../locale';

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
