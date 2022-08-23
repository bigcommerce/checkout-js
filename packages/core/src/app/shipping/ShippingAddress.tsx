import { Address, CheckoutSelectors, Consignment, Country, CustomerAddress, FormField, ShippingInitializeOptions, ShippingRequestOptions, StripeShippingEvent } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { noop } from 'lodash';
import React, { memo, useCallback, useContext, useEffect, useState, FunctionComponent } from 'react';

import CheckoutStepStatus from '../checkout/CheckoutStepStatus';
import { FormContext } from '../ui/form';
import getRecommendedShippingOption from './getRecommendedShippingOption';
import hasSelectedShippingOptions from './hasSelectedShippingOptions';

import RemoteShippingAddress from './RemoteShippingAddress';
import ShippingAddressForm from './ShippingAddressForm';
import { SingleShippingFormValues } from './SingleShippingForm';
import StaticAddressEditable from './StaticAddressEditable';
import StripeStateMapper from './StripeStateMapper';
import StripeupeShippingAddress from './StripeupeShippingAddress';

export interface ShippingAddressProps {
    addresses: CustomerAddress[];
    consignments: Consignment[];
    countries?: Country[];
    countriesWithAutocomplete: string[];
    customerEmail?: string;
    formFields: FormField[];
    googleMapsApiKey?: string;
    isLoading: boolean;
    isShippingStepPending: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowSaveAddress?: boolean;
    hasRequestedShippingOptions: boolean;
    isStripeLinkEnabled?: boolean;
    step: CheckoutStepStatus;
    shouldDisableSubmit: boolean;
    isStripeLoading?(): void;
    isStripeAutoStep?(): void;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onAddressSelect(address: Address): void;
    onFieldChange(name: string, value: string): void;
    onUnhandledError?(error: Error): void;
    onUseNewAddress(): void;
    onSubmit(values: SingleShippingFormValues): void;
}

const ShippingAddress: FunctionComponent<ShippingAddressProps> = props => {
    const {
        methodId,
        formFields,
        countries,
        countriesWithAutocomplete,
        customerEmail,
        consignments,
        googleMapsApiKey,
        onAddressSelect,
        onFieldChange,
        onUseNewAddress,
        initialize,
        deinitialize,
        isLoading,
        shippingAddress,
        hasRequestedShippingOptions,
        addresses,
        shouldShowSaveAddress,
        onUnhandledError = noop,
        isShippingStepPending,
        isStripeLinkEnabled,
        shouldDisableSubmit,
        onSubmit,
        step,
        isStripeLoading,
        isStripeAutoStep,
    } = props;

    const { setSubmitted } = useContext(FormContext);
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
    }, []);

    useEffect(() => {
        if (consignments[0]) {
            const {availableShippingOptions} = consignments[0];
            if (availableShippingOptions && !getRecommendedShippingOption(availableShippingOptions)) {
                handleLoading();
            }
        }
    }, [consignments]);

    useEffect(() => {
        if (!isFirstShippingRender && stripeShippingAddress.firstName && !isNewAddress && hasSelectedShippingOptions(consignments)) {
            setTimeout(() => {
                if (isStripeLoading && isStripeAutoStep) {
                    isStripeLoading();
                    isStripeAutoStep();
                }
                onSubmit({billingSameAsShipping: true, shippingAddress: stripeShippingAddress, orderComment: ''});
            }, 300);
        }
    }, [isFirstShippingRender, onSubmit, stripeShippingAddress, shouldDisableSubmit, isNewAddress ,consignments]);

    const availableShippingList = countries?.map(country => ({code: country.code, name: country.name}));
    const allowedCountries = availableShippingList ? availableShippingList.map(country => country.code).join(', ') : '';

    const handleStripeShippingAddress = useCallback(async (shipping: StripeShippingEvent) => {
        const {complete, value: { address = { country: '', state: '', line1: '', line2: '', city: '', postal_code: '' }
            , name = '' } } = shipping;

        if(complete) {
            if (step.isComplete) {
                handleLoading();
            }
            const names = name.split(' ');
            // @ts-ignore
            const country = availableShippingList?.find(country => country.code === address.country).name;
            const state = StripeStateMapper(address.country, address.state);
            const shippingValue = {
                firstName: names[0],
                lastName: names[1] || ' ',
                company: '',
                address1: address.line1,
                address2: address.line2 || '',
                city: address.city || ' ',
                stateOrProvince: state,
                stateOrProvinceCode: state,
                shouldSaveAddress: true,
                country: country || address.country,
                countryCode: address.country,
                postalCode: address.postal_code,
                phone: '',
                customFields: [],
            };
            if (!step.isComplete) {
                await setIsFirstShippingRender(current => !current);
            }
            await onAddressSelect(shippingValue);
            await setStripeShippingAddress(shippingValue);
            if (shipping.isNewAddress !== isNewAddress) {
                await setIsNewAddress(current => !current);
            }
        } else {
            handleLoading();
        }

    }, [availableShippingList, onAddressSelect]);

    const initializeShipping = useCallback(memoizeOne((defaultOptions: ShippingInitializeOptions) => (
        (options?: ShippingInitializeOptions) => initialize({
            ...defaultOptions,
            ...options,
        })
    )), []);

    const handleFieldChange: (fieldName: string, value: string) => void = (fieldName, value) => {
        if (hasRequestedShippingOptions) {
            setSubmitted(true);
        }

        onFieldChange(fieldName, value);
    };

    if (isStripeLinkEnabled && !customerEmail) {
        let options: ShippingInitializeOptions = {};

        options = {
            stripeupe: {
                container: 'StripeUpeShipping',
                onChangeShipping: handleStripeShippingAddress,
                availableCountries: allowedCountries,
            },
        };

        return (
            <StripeupeShippingAddress
                deinitialize={ deinitialize }
                formFields={ formFields }
                initialize={ initializeShipping(options) }
                isLoading={ isShippingStepPending }
                methodId={ 'stripeupe' }
            />
        );
    }

    if (methodId) {
        const containerId = 'addressWidget';
        let options: ShippingInitializeOptions = {};

        if (methodId === 'amazon') {
            options = {
                amazon: {
                    container: containerId,
                    onError: onUnhandledError,
                },
            };

            return (
                <RemoteShippingAddress
                    containerId={ containerId }
                    deinitialize={ deinitialize }
                    formFields={ formFields }
                    initialize={ initializeShipping(options) }
                    methodId={ methodId }
                    onFieldChange={ onFieldChange }
                />
            );
        }

        if (methodId === 'amazonpay' && shippingAddress) {
            const editAddressButtonId = 'edit-ship-button';

            options = {
                amazonpay: {
                    editAddressButtonId,
                },
            };

            return (
                <StaticAddressEditable
                    address={ shippingAddress }
                    buttonId={ editAddressButtonId }
                    deinitialize={ deinitialize }
                    formFields={ formFields }
                    initialize={ initializeShipping(options) }
                    isLoading={ isShippingStepPending }
                    methodId={ methodId }
                    onFieldChange={ onFieldChange }
                />
            );
        }
    }

    return (
        <ShippingAddressForm
            address={ shippingAddress }
            addresses={ addresses }
            consignments={ consignments }
            countries={ countries }
            countriesWithAutocomplete={ countriesWithAutocomplete }
            formFields={ formFields }
            googleMapsApiKey={ googleMapsApiKey }
            isLoading={ isLoading }
            onAddressSelect={ onAddressSelect }
            onFieldChange={ handleFieldChange }
            onUseNewAddress={ onUseNewAddress }
            shouldShowSaveAddress={ shouldShowSaveAddress }
        />
    );
};

export default memo(ShippingAddress);
