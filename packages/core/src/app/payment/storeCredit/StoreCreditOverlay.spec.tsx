import { LanguageService } from '@bigcommerce/checkout-sdk';
import { mount, shallow } from 'enzyme';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../../config/config.mock';

import StoreCreditOverlay from './StoreCreditOverlay';

describe('StoreCreditOverlay', () => {
    let localeContext: LocaleContextType;
    let languageService: LanguageService;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        languageService = localeContext.language;
    });

    it('displays "payment is not required" text', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <StoreCreditOverlay />
            </LocaleContext.Provider>,
        );

        expect(component.text()).toEqual(
            languageService.translate('payment.payment_not_required_text'),
        );
    });

    it('renders component with expected class', () => {
        const component = shallow(<StoreCreditOverlay />);

        expect(component.hasClass('storeCreditOverlay')).toBe(true);
    });
});
