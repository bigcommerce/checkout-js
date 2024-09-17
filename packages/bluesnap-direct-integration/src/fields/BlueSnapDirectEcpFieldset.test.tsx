import { createLanguageService } from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { render } from '@bigcommerce/checkout/test-utils';

import BlueSnapDirectEcpFieldset, {
    BlueSnapDirectEcpFieldsetProps,
} from './BlueSnapDirectEcpFieldset';

describe('BlueSnapDirectEcpFieldset', () => {
    let initialValues: { [key: string]: unknown };
    let options: BlueSnapDirectEcpFieldsetProps;

    beforeEach(() => {
        initialValues = {
            accountNumber: '',
            routingNumber: '',
        };
        options = {
            language: createLanguageService(),
        };
    });

    it('matches snapshot', () => {
        expect(
            render(
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <BlueSnapDirectEcpFieldset {...options} />
                </Formik>,
            ),
        ).toMatchSnapshot();
    });
});
