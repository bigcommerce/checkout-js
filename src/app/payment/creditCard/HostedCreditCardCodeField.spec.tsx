import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { IconHelp } from '../../ui/icon';
import { TooltipTrigger } from '../../ui/tooltip';

import HostedCreditCardCodeField, { HostedCreditCardCodeFieldProps } from './HostedCreditCardCodeField';

describe('HostedCreditCardCodeField', () => {
    let HostedCreditCardCodeFieldTest: FunctionComponent<HostedCreditCardCodeFieldProps>;
    let defaultProps: HostedCreditCardCodeFieldProps;
    let initialValues: { ccCvv: string };
    let localeContext: LocaleContextType;

    beforeEach(() => {
        initialValues = { ccCvv: '' };
        localeContext = createLocaleContext(getStoreConfig());
        defaultProps = {
            appearFocused: true,
            id: 'ccCvv',
            name: 'ccCvv',
        };

        HostedCreditCardCodeFieldTest = props => (
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <HostedCreditCardCodeField { ...props } />
                </Formik>
            </LocaleContext.Provider>
        );
    });

    it('renders field with tooltip icon', () => {
        const component = mount(<HostedCreditCardCodeFieldTest { ...defaultProps } />);

        expect(component.find(IconHelp).length)
            .toEqual(1);
        expect(component.find(TooltipTrigger).length)
            .toEqual(1);
    });
});
