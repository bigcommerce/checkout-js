import { CheckoutSelectors, Consignment, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { AnalyticsProviderMock } from '@bigcommerce/checkout/analytics';
import { LocaleProvider, TranslatedString } from '@bigcommerce/checkout/locale';

import { getCart } from '../../cart/carts.mock';
import { getConsignment } from '../consignment.mock';

import ShippingOptionsForm, { ShippingOptionsFormProps } from './ShippingOptionsForm';
import ShippingOptionsList from './ShippingOptionsList';

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

    const checkoutService = createCheckoutService();

    const TestWrap: React.FC = ({ children }) => (
        <AnalyticsProviderMock>
            <LocaleProvider checkoutService={checkoutService}>
                <Formik initialValues={{}} onSubmit={noop}>
                    {children}
                </Formik>
            </LocaleProvider>
        </AnalyticsProviderMock>
    );

    it('renders sorted options for all consignments when multi-shipping', () => {
        const component = mount(
            <TestWrap>
                <ShippingOptionsForm {...defaultProps} />
            </TestWrap>,
        );

        expect(component.find(ShippingOptionsList)).toHaveLength(2);

        expect(component.find('.shippingOptions-panel-message')).toHaveLength(0);
    });

    it('selects default shipping option once per consignment when updated consignment has no shipping option', async () => {
        const consignmentWithoutShippingOption: Consignment = {
            ...getConsignment(),
            selectedShippingOption: undefined,
        };

        mount(
            <TestWrap>
                <ShippingOptionsForm {...defaultProps} isMultiShippingMode={false} />
            </TestWrap>,
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

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.selectShippingOption).toHaveBeenCalledTimes(2);
    });

    it('renders enter shipping address when no consignments', () => {
        const component = mount(
            <TestWrap>
                <ShippingOptionsForm
                    {...defaultProps}
                    consignments={[]}
                    isLoading={() => false}
                    isMultiShippingMode={false}
                />
            </TestWrap>,
        );

        expect(component.find(TranslatedString).prop('id')).toBe(
            'shipping.enter_shipping_address_text',
        );
    });

    it('renders select shipping address when no consignments and amazon shipping', () => {
        const component = mount(
            <TestWrap>
                <ShippingOptionsForm
                    {...defaultProps}
                    consignments={[]}
                    isLoading={() => false}
                    methodId="amazonpay"
                />
            </TestWrap>,
        );

        expect(component.find(TranslatedString).prop('id')).toBe(
            'shipping.select_shipping_address_text',
        );
    });

    it('renders invalid shipping when no shipping options available', () => {
        const component = mount(
            <TestWrap>
                <ShippingOptionsForm
                    {...defaultProps}
                    consignments={[
                        {
                            ...getConsignment(),
                            availableShippingOptions: [],
                        },
                    ]}
                    isMultiShippingMode={false}
                />
            </TestWrap>,
        );

        expect(component.find('.shippingOptions-panel-message').text()).toEqual(
            defaultProps.invalidShippingMessage,
        );
    });
});
