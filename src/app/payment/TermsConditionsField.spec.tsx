import { mount, render } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType, TranslatedHtml } from '../locale';
import { TextArea } from '../ui/form';

import TermsConditionsField, { TermsConditionsType } from './TermsConditionsField';

describe('TermsConditionsField', () => {
    let localeContext: LocaleContextType;
    let initialValues: { terms: boolean };

    beforeEach(() => {
        initialValues = { terms: false };
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('renders terms and conditions as readonly text area if type is "textarea"', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <TermsConditionsField
                        name="terms"
                        terms="Hello world"
                        type={ TermsConditionsType.TextArea }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(TextArea).length)
            .toEqual(1);

        expect(component.find(TextArea).prop('defaultValue'))
            .toEqual('Hello world');

        expect(component.find(TextArea).prop('readOnly'))
            .toEqual(true);
    });

    it('renders terms and conditions checkbox as plain text if type is "textarea"', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <TermsConditionsField
                        name="terms"
                        terms="Hello world"
                        type={ TermsConditionsType.TextArea }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find('label[htmlFor="terms"]').text())
            .toEqual(localeContext.language.translate('terms_and_conditions.agreement_text'));
    });

    it('renders terms and conditions checkbox with link if type is "url"', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <TermsConditionsField
                        name="terms"
                        type={ TermsConditionsType.Link }
                        url="/terms-and-conditions"
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find('label[htmlFor="terms"]').html())
            .toContain(render(
                <LocaleContext.Provider value={ localeContext }>
                    <TranslatedHtml data={ { url: '/terms-and-conditions' } } id="terms_and_conditions.agreement_with_link_text" />
                </LocaleContext.Provider>
            ).html());
    });
});
