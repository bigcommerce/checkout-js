import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { FormField } from '../../ui/form';

import HostedCreditCardNumberField, {
    HostedCreditCardNumberFieldProps,
} from './HostedCreditCardNumberField';

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
