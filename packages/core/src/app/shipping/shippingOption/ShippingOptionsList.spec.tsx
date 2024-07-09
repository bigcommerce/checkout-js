import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, shallow } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../../config/config.mock';
import { ChecklistItem } from '../../ui/form';
import { LoadingOverlay } from '../../ui/loading';

import { getShippingOption } from './shippingMethod.mock';
import ShippingOptionsList from './ShippingOptionsList';
import StaticShippingOption from './StaticShippingOption';

describe('ShippingOptionsList Component', () => {
    const checkoutService = createCheckoutService();

    let localeContext: LocaleContextType;
    const shippingOptions = [
        {
            ...getShippingOption(),
            id: 'foo',
        },
        {
            ...getShippingOption(),
            id: 'bar',
        },
    ];

    const onSelected = jest.fn();

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('renders shipping option list with expected props', () => {
        const component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <ExtensionProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <ShippingOptionsList
                                consignmentId="c_id"
                                inputName="c_id"
                                isLoading={true}
                                isMultiShippingMode={true}
                                onSelectedOption={onSelected}
                                selectedShippingOptionId="bar"
                                shippingOptions={shippingOptions}
                            />
                        </Formik>
                    </LocaleContext.Provider>
                </ExtensionProvider>
            </CheckoutProvider>,
        );

        expect(component.find(LoadingOverlay).prop('isLoading')).toBeTruthy();
        expect(component.find(ChecklistItem)).toHaveLength(2);
        expect(component.find(StaticShippingOption).at(0).prop('method')).toMatchObject(
            shippingOptions[0],
        );

        expect(
            component
                .find('.form-checklist-item--selected')
                .find(StaticShippingOption)
                .prop('method'),
        ).toMatchObject(shippingOptions[1]);
    });

    it('does not render if there are no shipping options', () => {
        let component = shallow(
            <ShippingOptionsList
                consignmentId="c_id"
                inputName="c_id"
                isLoading={false}
                isMultiShippingMode={true}
                onSelectedOption={onSelected}
            />,
        );

        expect(component.getElement()).toBeFalsy();

        component = shallow(
            <ShippingOptionsList
                consignmentId="c_id"
                inputName="c_id"
                isLoading={false}
                isMultiShippingMode={true}
                onSelectedOption={onSelected}
                shippingOptions={[]}
            />,
        );

        expect(component.getElement()).toBeFalsy();
    });
});
