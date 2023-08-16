import { render } from '@testing-library/react';
import { Field, FieldProps, Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { PaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';
import {
    getCardInstrument,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutInstrumentSelect from './BraintreeAcceleratedCheckoutInstrumentSelect';

describe('BraintreeAcceleratedCheckoutInstrumentSelect', () => {
    it('renders instrument select', () => {
        const view = render(
            <Formik initialValues={{}} onSubmit={noop}>
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <PaymentFormContext.Provider
                        value={{ paymentForm: getPaymentFormServiceMock() }}
                    >
                        <Field
                            name="instrumentId"
                            render={(field: FieldProps<string>) => (
                                <BraintreeAcceleratedCheckoutInstrumentSelect
                                    instruments={[getCardInstrument()]}
                                    onSelectInstrument={noop}
                                    onUseNewInstrument={noop}
                                    {...field}
                                />
                            )}
                        />
                    </PaymentFormContext.Provider>
                </LocaleContext.Provider>
            </Formik>,
        );

        expect(view).toMatchSnapshot();
    });
});
