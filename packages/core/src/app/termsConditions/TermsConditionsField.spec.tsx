import { mount, render } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType, TranslatedHtml } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../config/config.mock';

import TermsConditionsField, { TermsConditionsType } from './TermsConditionsField';

describe('TermsConditionsField', () => {
    let localeContext: LocaleContextType;
    let initialValues: { terms: boolean };

    beforeEach(() => {
        initialValues = { terms: false };
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('renders terms and conditions checkbox with link if type is "modal"', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <TermsConditionsField
                        name="terms"
                        terms="Hello world"
                        type={TermsConditionsType.Modal}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find('label[htmlFor="terms"]').text()).toBe(
            'Yes, I agree with the terms and conditions.',
        );
    });

    it('renders terms and conditions checkbox with link if type is "text"', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <TermsConditionsField
                        name="terms"
                        terms="Hello world"
                        type={TermsConditionsType.TextArea}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find('label[htmlFor="terms"]').text()).toBe(
            'Yes, I agree with the above terms and conditions.',
        );

        expect(component.find('textarea').length).toBeGreaterThan(0);
    });

    it('renders terms and conditions checkbox with link if type is "url"', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <TermsConditionsField
                        name="terms"
                        type={TermsConditionsType.Link}
                        url="/terms-and-conditions"
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find('label[htmlFor="terms"]').html()).toContain(
            render(
                <LocaleContext.Provider value={localeContext}>
                    <TranslatedHtml
                        data={{ url: '/terms-and-conditions' }}
                        id="terms_and_conditions.agreement_with_link_text"
                    />
                </LocaleContext.Provider>,
            ).html(),
        );
    });
});
