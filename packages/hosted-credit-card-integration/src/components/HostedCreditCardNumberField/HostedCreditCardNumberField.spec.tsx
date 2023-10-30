import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { FormField } from '@bigcommerce/checkout/ui';

import { HostedCreditCardNumberField, HostedCreditCardNumberFieldProps } from '.';

describe('HostedCreditCardNumberField', () => {
    let HostedCreditCardNumberFieldTest: FunctionComponent<HostedCreditCardNumberFieldProps>;
    let defaultProps: HostedCreditCardNumberFieldProps;
    let initialValues: { ccNumber: string };
    let localeContext: LocaleContextType;

    beforeEach(() => {
        initialValues = { ccNumber: '' };
        localeContext = createLocaleContext(getStoreConfig());
        defaultProps = {
            appearFocused: true,
            id: 'ccNumber',
            name: 'ccNumber',
        };

        HostedCreditCardNumberFieldTest = (props) => (
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <HostedCreditCardNumberField {...props} />
                </Formik>
            </LocaleContext.Provider>
        );
    });

    it('renders field with expected class name', () => {
        const component = mount(<HostedCreditCardNumberFieldTest {...defaultProps} />);

        expect(component.find(FormField).prop('additionalClassName')).toContain(
            'form-field--ccNumber',
        );
    });
});
