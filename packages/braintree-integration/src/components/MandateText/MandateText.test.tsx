import { render, screen, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { FormikValues } from 'formik/dist/types';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-utils';

import getBraintreeAchValidationSchema from '../../validation-schemas/getBraintreeAchValidationSchema';
import { getValidData } from '../../validation-schemas/validation-schemas.mock';
import { formFieldData } from '../BraintreeAchPaymentForm';

import { MandateText, MandateTextProps } from './';

describe('MandateText', () => {
    let MandateTextTest: FunctionComponent<MandateTextProps>;
    let defaultProps: MandateTextProps;
    let initialValues: FormikValues;
    let validData: { [p: string]: string };

    beforeEach(() => {
        const { language } = createLocaleContext(getStoreConfig());

        defaultProps = {
            getFieldValue: jest.fn(),
            language,
            storeName: 'Test Store',
            outstandingBalance: 100,
            symbol: '$',
            isBusiness: false,
            validationSchema: getBraintreeAchValidationSchema({
                formFieldData,
                language,
            }),
            updateMandateText: jest.fn().mockReturnValue('mandate text'),
        };

        validData = getValidData();

        MandateTextTest = (props: MandateTextProps) => {
            return (
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                        <MandateText {...props} />
                    </LocaleContext.Provider>
                </Formik>
            );
        };
    });

    it('mandateText should be hidden', async () => {
        validData.accountNumber = '';
        validData.routingNumber = '';

        jest.spyOn(defaultProps, 'getFieldValue').mockImplementation((field) => {
            if (validData[field]) {
                return validData[field];
            }
        });

        render(<MandateTextTest {...defaultProps} />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(screen.queryByTestId('mandate-text')).not.toBeInTheDocument();
    });

    it('mandateText should be visible', async () => {
        jest.spyOn(defaultProps, 'getFieldValue').mockImplementation((field) => {
            if (validData[field]) {
                return validData[field];
            }
        });

        render(<MandateTextTest {...defaultProps} />);

        await waitFor(() => screen.findByTestId('mandate-text'));

        expect(screen.getByTestId('mandate-text')).toHaveTextContent(/By clicking Place Order/);
    });
});
