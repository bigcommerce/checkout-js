import { setPrototypeOf, CustomError } from '../../common/error';
import { getLanguageService } from '../../locale';

const languageService = getLanguageService();

export class AssignItemFailedError extends CustomError {
    constructor(data: Error) {
        super({
            name: 'ASSIGN_ITEM_FAILED',
            message: languageService.translate('shipping.assign_item_error'),
            data,
        });

        setPrototypeOf(this, AssignItemFailedError.prototype);
    }
}
