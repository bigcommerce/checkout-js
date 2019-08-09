import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop, range } from 'lodash';
import React, { FunctionComponent } from 'react';

import { Checklist, ChecklistItem } from '../../ui/form';
import { getPaymentMethod } from '../payment-methods.mock';

import PaymentMethodList, { PaymentMethodListProps } from './PaymentMethodList';

describe('PaymentMethodList', () => {
    let methods: PaymentMethod[];
    let PaymentMethodListTest: FunctionComponent<PaymentMethodListProps>;

    beforeEach(() => {
        methods = range(3).map(index => ({
            ...getPaymentMethod(),
            id: `method${index}`,
        }));

        PaymentMethodListTest = props => (
            <Formik
                initialValues={ { paymentProviderRadio: methods[0].id } }
                onSubmit={ noop }
            >
                <PaymentMethodList { ...props } />
            </Formik>
        );
    });

    it('renders payment methods as checklist', () => {
        const component = mount(<PaymentMethodListTest methods={ methods } />);

        expect(component.find(ChecklistItem))
            .toHaveLength(methods.length);
    });

    it('configures each item in list with value', () => {
        const component = mount(<PaymentMethodListTest methods={ methods } />);

        methods.forEach(({ id }, index) => {
            expect(component.find(ChecklistItem).at(index).prop('value'))
                .toEqual(id);
        });
    });

    it('generates unique value for multi-option payment method', () => {
        methods = [{
            ...getPaymentMethod(),
            id: 'visa',
            gateway: 'adyen',
        }];

        const component = mount(<PaymentMethodListTest methods={ methods } />);

        expect(component.find(ChecklistItem).at(0).prop('value'))
            .toEqual('adyen-visa');
    });

    it('triggers callback when method is selected', () => {
        const handleSelect = jest.fn();
        const component = mount(<PaymentMethodListTest
            methods={ methods }
            onSelect={ handleSelect }
        />);

        // tslint:disable-next-line:no-non-null-assertion
        component.find(Checklist).prop('onSelect')!(methods[1].id);

        expect(handleSelect)
            .toHaveBeenCalledWith(methods[1]);
    });

    it('sets default selected item using initial value from from', () => {
        const component = mount(<PaymentMethodListTest methods={ methods } />);

        expect(component.find(Checklist).prop('defaultSelectedItemId'))
            .toEqual(methods[0].id);
    });
});
