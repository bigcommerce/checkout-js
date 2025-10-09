import { checkoutSettings } from './checkout-settings.mock';
import { checkout } from './checkout.mock';
import { formFields } from './form-fields';

export const initialState = {
    config: checkoutSettings,
    checkout,
    formFields,
    extensions: [],
};
