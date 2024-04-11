import '@testing-library/jest-dom';
import { Field, FieldProps, Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { PaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';
import { getCardInstrument, getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutInstrumentSelect from './BraintreeAcceleratedCheckoutInstrumentSelect';

describe('BraintreeAcceleratedCheckoutInstrumentSelect', () => {
    it('renders instrument select', () => {
        const cardInstrument = getCardInstrument();

        const view = render(
            <Formik initialValues={{}} onSubmit={noop}>
                <PaymentFormContext.Provider value={{ paymentForm: getPaymentFormServiceMock() }}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <BraintreeAcceleratedCheckoutInstrumentSelect
                                instruments={[cardInstrument]}
                                onSelectInstrument={noop}
                                onUseNewInstrument={noop}
                                selectedInstrument={cardInstrument}
                                {...field}
                            />
                        )}
                    />
                </PaymentFormContext.Provider>
            </Formik>,
        );

        expect(view).toMatchSnapshot();
    });
});
