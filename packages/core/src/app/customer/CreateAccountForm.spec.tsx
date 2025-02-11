import { FormField, RequestError } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType, TranslatedString } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../config/config.mock';
import { Alert } from '../ui/alert';

import CreateAccountForm from './CreateAccountForm';
import { getCustomerAccountFormFields } from './formField.mock';

describe('CreateAccountForm Component', () => {
    let localeContext: LocaleContextType;
    let component: ReactWrapper;
    let formFields: FormField[];

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        formFields = getCustomerAccountFormFields();
    });

    it('renders email in use error when present', () => {
        const onCancel = jest.fn();
        const createAccountError = {
            message: 'Email already in use: test@bigcommerce.com',
            type: 'request',
            status: 409,
        } as RequestError;

        component = mount(
            <LocaleContext.Provider value={localeContext}>
                <CreateAccountForm
                    createAccountError={createAccountError}
                    formFields={formFields}
                    onCancel={onCancel}
                    requiresMarketingConsent={false}
                />
            </LocaleContext.Provider>,
        );

        expect(component.find(Alert).find(TranslatedString).props()).toEqual({
            data: { email: 'test@bigcommerce.com' },
            id: 'customer.email_in_use_text',
        });
    });
});
