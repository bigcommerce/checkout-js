import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop, range } from 'lodash';
import React, { FunctionComponent } from 'react';

import { Checklist, ChecklistItem } from '../../ui/form';
import { getMobilePaymentMethod, getPaymentMethod } from '../payment-methods.mock';

import PaymentMethodList, { PaymentMethodListProps } from './PaymentMethodList';

describe('PaymentMethodList', () => {
    let methods: PaymentMethod[];
    let PaymentMethodListTest: FunctionComponent<PaymentMethodListProps>;

    beforeEach(() => {
        methods = range(3).map((index) => ({
            ...getPaymentMethod(),
            id: `method${index}`,
        }));

        PaymentMethodListTest = (props) => (
            <Formik initialValues={{ paymentProviderRadio: methods[0].id }} onSubmit={noop}>
                <PaymentMethodList {...props} />
            </Formik>
        );
    });

    it('renders payment methods as checklist', () => {
        const component = mount(<PaymentMethodListTest methods={methods} />);

        expect(component.find(ChecklistItem)).toHaveLength(methods.length);
    });

    it('renders mobile payment methods as checklist on mobile device', () => {
        methods = [getMobilePaymentMethod(), getPaymentMethod()];

        // @ts-ignore: setter for userAgent is defined in jest-setup.ts
        window.navigator.userAgent =
            'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1';

        const component = mount(<PaymentMethodListTest methods={methods} />);

        expect(component.find(ChecklistItem)).toHaveLength(2);
    });

    it('does not renders mobile payment methods as checklist on desktop', () => {
        methods = [getMobilePaymentMethod(), getPaymentMethod()];

        // @ts-ignore: setter for userAgent is defined in jest-setup.ts
        window.navigator.userAgent =
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36';

        const component = mount(<PaymentMethodListTest methods={methods} />);

        expect(component.find(ChecklistItem)).toHaveLength(1);
    });

    it('configures each item in list with value', () => {
        const component = mount(<PaymentMethodListTest methods={methods} />);

        methods.forEach(({ id }, index) => {
            expect(component.find(ChecklistItem).at(index).prop('value')).toEqual(id);
        });
    });

    it('generates unique value for multi-option payment method', () => {
        methods = [
            {
                ...getPaymentMethod(),
                id: 'visa',
                gateway: 'adyen',
            },
        ];

        const component = mount(<PaymentMethodListTest methods={methods} />);

        expect(component.find(ChecklistItem).at(0).prop('value')).toBe('adyen-visa');
    });

    it('triggers callback when method is selected', () => {
        const handleSelect = jest.fn();
        const component = mount(
            <PaymentMethodListTest methods={methods} onSelect={handleSelect} />,
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        component.find(Checklist).prop('onSelect')!(methods[1].id);

        expect(handleSelect).toHaveBeenCalledWith(methods[1]);
    });

    it('sets default selected item using initial value from from', () => {
        const component = mount(<PaymentMethodListTest methods={methods} />);

        expect(component.find(Checklist).prop('defaultSelectedItemId')).toEqual(methods[0].id);
    });
});
