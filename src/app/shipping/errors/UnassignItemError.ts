import { setPrototypeOf, CustomError } from '../../common/error';
import { getLanguageService } from '../../locale';

const languageService = getLanguageService();

export class UnassignItemError extends CustomError {
    constructor(data: Error) {
        super({
            name: 'UNASSIGN_ITEM_FAILED',
            message: languageService.translate('shipping.unassign_item_error'),
            data,
        });

        setPrototypeOf(this, UnassignItemError.prototype);
    }
}
