import { CheckoutSelectors, Consignment } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { getCart } from '../../cart/carts.mock';
import { TranslatedString } from '../../locale';
import { getConsignment } from '../consignment.mock';

import ShippingOptionsForm, { ShippingOptionsFormProps } from './ShippingOptionsForm';
import ShippingOptionsList from './ShippingOptionsList';

/* eslint-disable react/jsx-no-bind */
describe('ShippingOptions Component', () => {
    const consignments = [
        {
            ...getConsignment(),
            id: 'bar',
        },
        {
            ...getConsignment(),
            id: 'foo',
        },
    ];
    let triggerConsignmentsUpdated: (state: CheckoutSelectors) => void;
    const defaultProps: ShippingOptionsFormProps = {
        isMultiShippingMode: true,
        consignments,
        invalidShippingMessage: 'foo',
        cart: getCart(),
        shouldShowShippingOptions: true,
        isSelectingShippingOption: jest.fn(() => false),
        subscribeToConsignments: ((subscriber: (state: CheckoutSelectors) => void) => {
            triggerConsignmentsUpdated = subscriber;
        }) as any,
        selectShippingOption: jest.fn(() => Promise.resolve()) as any,
        isLoading: jest.fn(() => false),
    };

    it('renders sorted options for all consignments when multi-shipping', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <ShippingOptionsForm
                    { ...defaultProps }
                />
            </Formik>
        );

        expect(component.find(ShippingOptionsList).length).toEqual(2);

        expect(component.find('.shippingOptions-panel-message').length)
            .toEqual(0);
    });

    it('selects default shipping option once per consignment when updated consignment has no shipping option', async () => {
        const consignmentWithoutShippingOption: Consignment = {
            ...getConsignment(),
            selectedShippingOption: undefined,
        };

        mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <ShippingOptionsForm
                    { ...defaultProps }
                    isMultiShippingMode={ false }
                />
            </Formik>
        );

        const selectors = {
            data: {
                getConsignments: () => [
                    consignmentWithoutShippingOption,
                    getConsignment(),
                    consignmentWithoutShippingOption,
                ],
            },
        } as CheckoutSelectors;

        triggerConsignmentsUpdated(selectors);
        triggerConsignmentsUpdated(selectors);

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.selectShippingOption).toHaveBeenCalledTimes(2);
    });

    it('renders enter shipping address when no consignments', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <ShippingOptionsForm
                    { ...defaultProps }
                    consignments={ [] }
                    isLoading={ () => false }
                    isMultiShippingMode={ false }
                />
            </Formik>
        );

        expect(component.find(TranslatedString).prop('id'))
            .toEqual('shipping.enter_shipping_address_text');
    });

    it('renders select shipping address when no consignments and amazon shipping', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <ShippingOptionsForm
                    { ...defaultProps }
                    consignments={ [] }
                    isLoading={ () => false }
                    methodId="amazon"
                />
            </Formik>
        );

        expect(component.find(TranslatedString).prop('id'))
            .toEqual('shipping.select_shipping_address_text');
    });

    it('renders invalid shipping when no shipping options available', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <ShippingOptionsForm
                    { ...defaultProps }
                    consignments={ [ {
                        ...getConsignment(),
                        availableShippingOptions: [],
                    } ] }
                    isMultiShippingMode={ false }
                />
            </Formik>
        );

        expect(component.find('.shippingOptions-panel-message').text())
            .toEqual(defaultProps.invalidShippingMessage);
    });
});
