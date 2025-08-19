/* eslint-disable testing-library/no-container */
import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import MollieAPMCustomForm, {
    type Issuer,
    type MollieCustomCardFormProps,
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
        const { container } = render(
            <MollieAPMCustomFormTest method={{ ...method, initializationData: {} }} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('should render MollieAPMCustomForm', () => {
        const { container } = render(<MollieAPMCustomFormTest method={method} />);
        const dropdownTrigger = container.querySelector('.dropdownTrigger');

        expect(dropdownTrigger).toBeInTheDocument();
        expect(dropdownTrigger).toContainElement(container.querySelector('#issuerToggle'));
    });

    it('should change IssuerSelectButton Value when option is selected', () => {
        render(<MollieAPMCustomFormTest method={method} />);

        expect(screen.getByText('Select your bank')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Select your bank'));
        expect(screen.getByText('kbc')).toBeInTheDocument();
        fireEvent.click(screen.getByText('kbc'));
    });
});
