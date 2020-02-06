import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType, TranslatedHtml } from '../locale';
import { CheckboxFormField } from '../ui/form';

import PrivacyPolicyField from './PrivacyPolicyField';

describe('PrivacyPolicyField', () => {
    let localeContext: LocaleContextType;
    let initialValues: { terms: boolean };

    beforeEach(() => {
        initialValues = { terms: false };
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('renders checkbox with external link', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <PrivacyPolicyField url="foo" />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(CheckboxFormField)).toHaveLength(1);
        expect(component.find(TranslatedHtml).props()).toMatchObject({
            data: { url: 'foo' },
            id: 'privacy_policy.label',
        });
    });
});
