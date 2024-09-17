import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import { TranslatedString, TranslatedStringProps } from '@bigcommerce/checkout/locale';

import ManageInstrumentsAlert from './ManageInstrumentsAlert';

describe('ManageInstrumentsAlert', () => {
    it('displays error message caused by authentication issue', () => {
        const error = { status: 401 };
        const component = shallow(<ManageInstrumentsAlert error={error} />);

        expect(
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (component.find(TranslatedString) as ShallowWrapper<TranslatedStringProps>).prop('id'),
        ).toBe('payment.instrument_manage_delete_auth_error');
    });

    it('displays error message caused by client issue', () => {
        const error = { status: 400 };
        const component = shallow(<ManageInstrumentsAlert error={error} />);

        expect(
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (component.find(TranslatedString) as ShallowWrapper<TranslatedStringProps>).prop('id'),
        ).toBe('payment.instrument_manage_delete_client_error');
    });

    it('displays error message caused by server issue', () => {
        const error = { status: 500 };
        const component = shallow(<ManageInstrumentsAlert error={error} />);

        expect(
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (component.find(TranslatedString) as ShallowWrapper<TranslatedStringProps>).prop('id'),
        ).toBe('payment.instrument_manage_delete_server_error');
    });
});
