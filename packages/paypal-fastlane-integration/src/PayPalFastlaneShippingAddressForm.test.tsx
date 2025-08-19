import { render, screen } from '@testing-library/react';
import React, { createRef } from 'react';

import { getCustomer } from '@bigcommerce/checkout/test-mocks';

import PayPalFastlaneShippingAddressForm, {
    type PayPalFastlaneAddressComponentRef,
    type PayPalFastlaneStaticAddressProps,
} from './PayPalFastlaneShippingAddressForm';

jest.mock('@bigcommerce/checkout/locale', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    withDate: jest.fn().mockReturnValue({ locale: 'en' }),
    localizeAddress: jest.fn().mockReturnValue({ firstName: 'test-name' }),
    language: jest.fn().mockReturnValue({ translate: jest.fn().mockReturnValue('string') }),
    TranslatedString: () => {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    },
}));

jest.mock('../../ui/src/form/DynamicFormField', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    DynamicFormField: () => {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    },
}));

describe('PayPalFastlaneShippingAddressForm', () => {
    let defaultProps: PayPalFastlaneStaticAddressProps;

    beforeEach(() => {
        defaultProps = {
            address: getCustomer().addresses[0],
            paypalFastlaneShippingComponentRef: createRef<PayPalFastlaneAddressComponentRef>(),
            formFields: [
                {
                    custom: false,
                    default: 'NO PO BOX',
                    id: 'field_18',
                    label: 'Address Line 1',
                    name: 'address1',
                    required: true,
                },
                {
                    custom: true,
                    default: '',
                    id: 'field_19',
                    label: 'Address Line 2',
                    name: 'address2',
                    required: false,
                },
            ],
            isLoading: false,
            methodId: 'method',
            deinitialize: jest.fn(),
            initialize: jest.fn(),
            onAddressSelect: jest.fn(),
            onFieldChange: jest.fn(),
            onUnhandledError: jest.fn(),
            countries: [
                {
                    code: 'US',
                    name: 'United States',
                    hasPostalCodes: true,
                    requiresState: true,
                    subdivisions: [
                        { code: 'CA', name: 'California' },
                        { code: 'TX', name: 'Texas' },
                    ],
                },
            ],
        };
    });

    it('renders PayPalFastlaneShippingAddressForm', () => {
        render(<PayPalFastlaneShippingAddressForm {...defaultProps} />);

        expect(screen.getByText('test-name')).toBeInTheDocument();
    });
});
