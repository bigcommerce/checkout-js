import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../../config/config.mock';

import HostedCreditCardCodeField from './HostedCreditCardCodeField';
import HostedCreditCardNumberField from './HostedCreditCardNumberField';
import HostedCreditCardExpiryField from './HostedCreditCardExpiryField';
import HostedCreditCardValidation, {
    HostedCreditCardValidationProps,
} from './HostedCreditCardValidation';

describe('HostedCreditCardValidation', () => {
    let HostedCreditCardValidationTest: FunctionComponent<HostedCreditCardValidationProps>;

    beforeEach(() => {
        const localeContext = createLocaleContext(getStoreConfig());

        HostedCreditCardValidationTest = (props) => (
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <HostedCreditCardValidation {...props} />
                </Formik>
            </LocaleContext.Provider>
        );
    });

    it('shows card number field if configured', () => {
        const component = mount(<HostedCreditCardValidationTest cardNumberId="cardNumber" />);

        expect(component.find(HostedCreditCardNumberField)).toHaveLength(1);
    });

    it('hides card number field if configured', () => {
        const component = mount(<HostedCreditCardValidationTest cardCodeId="cardCode" />);

        expect(component.find(HostedCreditCardNumberField)).toHaveLength(0);
    });

    it('shows card code field if configured', () => {
        const component = mount(<HostedCreditCardValidationTest cardCodeId="cardCode" />);

        expect(component.find(HostedCreditCardCodeField)).toHaveLength(1);
    });

    it('hides card code field if configured', () => {
        const component = mount(<HostedCreditCardValidationTest cardNumberId="cardNumber" />);

        expect(component.find(HostedCreditCardCodeField)).toHaveLength(0);
    });

    it('shows card expiry field if configured', () => {
        const component = mount(<HostedCreditCardValidationTest cardExpiryId="cardExpiry" />);

        expect(component.find(HostedCreditCardExpiryField)).toHaveLength(1);
    });

    it('hides card expiry field if configured', () => {
        const component = mount(<HostedCreditCardValidationTest cardNumberId="cardCode" />);

        expect(component.find(HostedCreditCardExpiryField)).toHaveLength(0);
    });
});
