import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../../config/config.mock';
import { DropdownTrigger } from '../../ui/dropdown';

import MollieAPMCustomForm, {
    Issuer,
    IssuerSelectButton,
    MollieCustomCardFormProps,
    OptionButton,
} from './MollieAPMCustomForm';

describe('MollieAPMCustomForm', () => {
    let localeContext: LocaleContextType;
    const issuer: Issuer = {
        id: 'kbc',
        name: 'kbc',
        image: {
            size1x: 'logo.png',
        },
    };
    const method: PaymentMethod = {
        id: 'mollie',
        method: 'kbc/cbc',
        supportedCards: [],
        config: {},
        type: 'card',
        initializationData: {
            paymentMethodsResponse: [
                issuer,
                {
                    id: 'cbc',
                    name: 'cbc',
                    image: {
                        size1x: 'logo.png',
                    },
                },
            ],
        },
    };
    let MollieAPMCustomFormTest: FunctionComponent<MollieCustomCardFormProps>;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());

        MollieAPMCustomFormTest = (props: MollieCustomCardFormProps) => (
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <MollieAPMCustomForm {...props} />
                </Formik>
            </LocaleContext.Provider>
        );
    });

    it('should empty render', () => {
        const container = mount(
            <MollieAPMCustomFormTest method={{ ...method, initializationData: {} }} />,
        );

        expect(container.isEmptyRender()).toBe(true);
    });

    it('should render MollieAPMCustomForm', () => {
        const container = mount(<MollieAPMCustomFormTest method={method} />);

        expect(container.find(DropdownTrigger)).toHaveLength(1);
    });

    it('should change IssuerSelectButton Value when option is selected', () => {
        const container = mount(<MollieAPMCustomFormTest method={method} />);

        expect(container.find(IssuerSelectButton).props()).toEqual(
            expect.objectContaining({
                selectedIssuer: {
                    id: '',
                    image: {
                        size1x: '',
                    },
                    name: 'Select your bank',
                },
            }),
        );

        container.find(DropdownTrigger).simulate('click');
        container
            .find(OptionButton)
            .at(0)
            .simulate('click', { currentTarget: { dataset: { id: 'kbc' } } });

        expect(container.find(IssuerSelectButton).props()).toEqual(
            expect.objectContaining({
                selectedIssuer: issuer,
            }),
        );
    });
});
