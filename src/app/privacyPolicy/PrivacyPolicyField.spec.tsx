import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType, TranslatedHtml } from '../locale';
import { CheckboxFormField } from '../ui/form';
import { ModalLink } from '../ui/modal';

import PrivacyPolicyField, { PrivacyPolicyType } from './PrivacyPolicyField';

describe('PrivacyPolicyField', () => {
    let localeContext: LocaleContextType;
    let initialValues: { terms: boolean };

    beforeEach(() => {
        initialValues = { terms: false };
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('renders checkbox with modal link if type is "text"', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <PrivacyPolicyField
                        type={ PrivacyPolicyType.Text }
                        value="foo"
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(CheckboxFormField)).toHaveLength(1);
        expect(component.find(ModalLink)).toHaveLength(1);
    });

    it('renders checkbox with external link if type is "link"', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <PrivacyPolicyField
                        type={ PrivacyPolicyType.Link }
                        value="foo"
                    />
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
