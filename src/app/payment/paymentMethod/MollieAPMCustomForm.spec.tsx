import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { DropdownTrigger } from '../../ui/dropdown';

import MollieAPMCustomForm, { MollieCustomCardFormProps } from './MollieAPMCustomForm';

describe('MollieAPMCustomForm', () => {
    const method: PaymentMethod = {
        id: 'mollie',
        method: 'kbc/cbc',
        supportedCards: [],
        config: {},
        type: 'card',
        initializationData: {
            paymentMethodsResponse: [
                {
                    resource: 'kbc',
                    id: 'kbc',
                    name: 'kbc',
                    image: {
                        size1x: 'logo.png',
                    },
                },
            ],
        },
    };
    let MollieAPMCustomFormTest: FunctionComponent<MollieCustomCardFormProps> ;

    beforeEach(() => {
        MollieAPMCustomFormTest = (props: MollieCustomCardFormProps) => (
            <Formik
                initialValues={ {} }
                onSubmit={ noop }
            >
                <MollieAPMCustomForm { ...props } />
            </Formik>
        );
    });

    it('should empty render', () => {
        const container = mount(<MollieAPMCustomFormTest method={ { ...method, initializationData: {} } } />);

        expect(container.isEmptyRender()).toBe(true);
    });

    it('should render MollieAPMCustomForm', () => {
        const container = mount(<MollieAPMCustomFormTest method={ method } />);

        expect(container.find(DropdownTrigger)).toHaveLength(1);
    });
});
