import {
    Address,
    CheckoutSelectors,
    Consignment,
    Country,
    ShippingInitializeOptions,
    ShippingRequestOptions,
    StripeShippingEvent
} from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import React, { FunctionComponent, memo, useCallback, useEffect, useState } from 'react';

import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';

import CheckoutStepStatus from '../../checkout/CheckoutStepStatus';
import getRecommendedShippingOption from '../getRecommendedShippingOption';
import hasSelectedShippingOptions from '../hasSelectedShippingOptions';
import { SingleShippingFormValues } from '../SingleShippingForm';

import StripeShippingAddressDisplay from './StripeShippingAddressDisplay';
import StripeStateMapper from './StripeStateMapper';

export interface StripeShippingAddressProps {
    consignments: Consignment[];
    countries?: Country[];
    shippingAddress?: Address;
    step: CheckoutStepStatus;
    isShippingMethodLoading: boolean;
    shouldDisableSubmit: boolean;
    isStripeLoading?(): void;
    isStripeAutoStep?(): void;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onAddressSelect(address: Address): void;
    onSubmit(values: SingleShippingFormValues): void;
}

const StripeShippingAddress: FunctionComponent<StripeShippingAddressProps> = (props) => {
    const {
        countries,
        consignments,
        onAddressSelect,
        initialize,
        deinitialize,
        shouldDisableSubmit,
        onSubmit,
        step,
        isStripeLoading,
        isStripeAutoStep,
        isShippingMethodLoading,
        shippingAddress,
    } = props;

    const [isNewAddress, setIsNewAddress] = useState(true);
    const [isFirstShippingRender, setIsFirstShippingRender] = useState(true);
    const [stripeShippingAddress, setStripeShippingAddress] =  useState({
        firstName: '',
        lastName: '',
        company: '',
        address1: '',
        address2: '',
        city: '',
        stateOrProvince: '',
        stateOrProvinceCode: '',
        shouldSaveAddress: true,
        country: '',
        countryCode: '',
        postalCode: '',
        phone: '',
        customFields: [],
    });

    const handleLoading = useCallback(() => {
        if (isStripeLoading) {
            isStripeLoading();
        }
    }, [isStripeLoading]);

    useEffect(() => {
        if (consignments[0]) {
            const {availableShippingOptions} = consignments[0];

            if (availableShippingOptions && !getRecommendedShippingOption(availableShippingOptions)) {
                handleLoading();
            }
        }
    }, [consignments]);

    useEffect(() => {
        const hasStripeAddressAndHasShippingOptions = stripeShippingAddress.firstName && hasSelectedShippingOptions(consignments);
        const afterReload = !isFirstShippingRender && !isNewAddress && !isShippingMethodLoading;
        const isLoadingBeforeAutoStep =  isStripeLoading && isStripeAutoStep;

        if (hasStripeAddressAndHasShippingOptions && afterReload && isLoadingBeforeAutoStep) {
            isStripeLoading();
            isStripeAutoStep();
            onSubmit({billingSameAsShipping: true, shippingAddress: stripeShippingAddress, orderComment: ''});
        }
    }, [isFirstShippingRender, onSubmit, stripeShippingAddress, shouldDisableSubmit, isShippingMethodLoading, isNewAddress ,consignments]);

    const availableShippingList = countries?.map(country => ({code: country.code, name: country.name}));
    const allowedCountries = availableShippingList ? availableShippingList.map(country => country.code).join(', ') : '';
    const shouldShowContent = (isNewAddress = true, phoneFieldRequired: boolean, phone: string) => {
        const stepCompleted = step.isComplete;
        const shippingPopulated = shippingAddress?.firstName && isNewAddress;
        const PhoneRequiredAndNotFilled = phoneFieldRequired && !phone;

        return stepCompleted || shippingPopulated || PhoneRequiredAndNotFilled;
    };

    const handleStripeShippingAddress = useCallback(async (shipping: StripeShippingEvent) => {
        const {complete, phoneFieldRequired, value: { address = { country: '', state: '', line1: '', line2: '', city: '', postal_code: '' }
            , name = '', firstName = '', lastName = '', phone = '' } } = shipping;

        if (complete) {
            if (shouldShowContent(shipping?.isNewAddress, phoneFieldRequired, phone)) {
                handleLoading();
            }

            const names = name?.split(' ');

            // @ts-ignore
            const country = availableShippingList?.find(country => country.code === address.country).name;
            const state = StripeStateMapper(address.country, address.state);
            const shippingValue = {
                firstName: firstName || names[0],
                lastName: lastName || names[1],
                company: '',
                address1: address.line1,
                address2: address.line2 || '',
                city: address.city,
                stateOrProvince: state,
                stateOrProvinceCode: state,
                shouldSaveAddress: true,
                country: country || address.country,
                countryCode: address.country,
                postalCode: address.postal_code,
                phone: phone || '',
                customFields: [],
            };

            if (!step.isComplete) {
                setIsFirstShippingRender(current => !current);
            }

            onAddressSelect(shippingValue);
            setStripeShippingAddress(shippingValue);

            if (shipping.isNewAddress !== isNewAddress) {
                setIsNewAddress(current => !current);
            }
        } else {
            handleLoading();
        }

    }, [availableShippingList, onAddressSelect]);

    const initializeShipping = useCallback(
        memoizeOne(
            (defaultOptions: ShippingInitializeOptions) => (options?: ShippingInitializeOptions) =>
                initialize({
                    ...defaultOptions,
                    ...options,
                }),
        ),
        [],
    );

    const getStylesFromElement = (
        id: string,
        properties: string[]) => {
        const parentContainer = document.getElementById(id);

        if (parentContainer) {
            return getAppliedStyles(parentContainer, properties);
        }

        return undefined;
    };

    const getStripeStyles: any = useCallback( () => {
        const containerId = 'stripe-card-component-field';
        const formInput = getStylesFromElement(`${containerId}--input`, ['color', 'background-color', 'border-color', 'box-shadow']);
        const formLabel = getStylesFromElement(`${containerId}--label`, ['color']);
        const formError = getStylesFromElement(`${containerId}--error`, ['color']);

        return formLabel && formInput && formError ? {
            labelText: formLabel.color,
            fieldText: formInput.color,
            fieldPlaceholderText: formInput.color,
            fieldErrorText: formError.color,
            fieldBackground: formInput['background-color'],
            fieldInnerShadow: formInput['box-shadow'],
            fieldBorder: formInput['border-color'],
        } : undefined;
    }, [])

        const options: ShippingInitializeOptions = {
            stripeupe: {
                container: 'StripeUpeShipping',
                onChangeShipping: handleStripeShippingAddress,
                availableCountries: allowedCountries,
                getStyles: getStripeStyles,
                getStripeState: StripeStateMapper,
                gatewayId: 'stripeupe',
                methodId: 'card',
            },
        };

        const renderCheckoutThemeStylesForStripeUPE = () => {
            const containerId = 'stripe-card-component-field';

            return (
                <div
                    className="optimizedCheckout-form-input"
                    id={ `${containerId}--input` }
                    placeholder="1111"
                >
                    <div
                        className="form-field--error"
                    >
                        <div
                            className="optimizedCheckout-form-label"
                            id={ `${containerId}--error` }
                        />
                    </div>
                    <div
                        className="optimizedCheckout-form-label"
                        id={ `${containerId}--label` }
                    />
                </div>
            );
        };

        return (
            <>
                <StripeShippingAddressDisplay
                    deinitialize={ deinitialize }
                    initialize={ initializeShipping(options) }
                    methodId="stripeupe"
                />
                { renderCheckoutThemeStylesForStripeUPE() }
            </>
        );
};

export default memo(StripeShippingAddress);
