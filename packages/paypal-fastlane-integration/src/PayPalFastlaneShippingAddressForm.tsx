import React, { memo, useEffect, useRef } from 'react';
import {
    Address,
    CheckoutSelectors,
    Country,
    CustomerAddress,
    FormField,
    ShippingInitializeOptions,
    ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';

import { TranslatedString, localizeAddress } from '@bigcommerce/checkout/locale';
import {
    Button,
    ButtonSize,
    ButtonVariant,
    DynamicFormField,
    Fieldset,
    LoadingOverlay,
} from '@bigcommerce/checkout/ui';

import isPayPalCommerceFastlaneMethod from './is-paypal-commerce-fastlane-method';
import PoweredByPayPalFastlaneLabel from './PoweredByPayPalFastlaneLabel';

export interface PayPalFastlaneStaticAddressProps {
    address: Address;
    formFields: FormField[];
    isLoading: boolean;
    methodId: string;
    deinitialize(options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options?: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onAddressSelect(address: Address): void;
    onFieldChange(fieldName: string, value: string): void;
    onUnhandledError?(error: Error): void;
    countries?: Country[];
}

export interface PayPalFastlaneAddressComponentRef {
    showAddressSelector?: () => Promise<CustomerAddress | undefined>;
}

const PayPalFastlaneShippingAddressForm = (props: PayPalFastlaneStaticAddressProps) => {
    const {
        address: addressWithoutLocalization,
        methodId,
        formFields,
        isLoading,
        initialize,
        deinitialize,
        onUnhandledError,
        onFieldChange,
        countries,
    } = props;
    const address = localizeAddress(addressWithoutLocalization, countries);

    const paypalFastlaneShippingComponent = useRef<PayPalFastlaneAddressComponentRef>({});

    const paypalCommerceFastlaneOptions = {
        paypalcommercefastlane: {
            onPayPalFastlaneAddressChange: (showPayPalFastlaneAddressSelector: PayPalFastlaneAddressComponentRef['showAddressSelector']) => {
                paypalFastlaneShippingComponent.current.showAddressSelector = showPayPalFastlaneAddressSelector;
            },
        },
    };

    const braintreeFastlaneOptions = {
        braintreefastlane: {
            onPayPalFastlaneAddressChange: (showPayPalFastlaneAddressSelector: PayPalFastlaneAddressComponentRef['showAddressSelector']) => {
                paypalFastlaneShippingComponent.current.showAddressSelector = showPayPalFastlaneAddressSelector;
            },
        },
    }

    const initializationOptions: ShippingInitializeOptions = isPayPalCommerceFastlaneMethod(methodId)
        ? paypalCommerceFastlaneOptions
        : braintreeFastlaneOptions;

    const initializeShippingStrategyOrThrow = async () => {
        try {
            await initialize({
                methodId,
                ...initializationOptions,
            });
        } catch (error) {
            if (typeof onUnhandledError === 'function' && error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    const deinitializeShippingStrategyOrThrow = async () => {
        try {
            await deinitialize({ methodId });
        } catch (error) {
            if (typeof onUnhandledError === 'function' && error instanceof Error) {
                onUnhandledError(error);
            }
        }
    }

    useEffect(() => {
        void initializeShippingStrategyOrThrow();

        return () => {
            void deinitializeShippingStrategyOrThrow();
        };
    }, []);


    const customFormFields = formFields.filter(({ custom }) => custom);
    const shouldShowCustomFormFields = customFormFields.length > 0;

    const handleFieldValueChange: (name: string) => (value: string) => void =
        (name) => (value) => onFieldChange(name, value);

    const handleEditButtonClick = async () => {
        if (typeof paypalFastlaneShippingComponent.current.showAddressSelector === 'function') {
            const selectedAddress = await paypalFastlaneShippingComponent.current.showAddressSelector();

            if (selectedAddress) {
                props.onAddressSelect({
                    ...selectedAddress,
                    ...(shouldShowCustomFormFields ? address.customFields : {}),
                });
            }
        }
    }

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
            <div className="stepHeader" style={{ padding: 0 }}>
                <div className="stepHeader-body subheader">
                    <div className="vcard checkout-address--static">
                        {(address.firstName || address.lastName) && (
                            <p className="fn address-entry">
                                <span className="first-name">{`${address.firstName} `}</span>
                                <span className="family-name">{address.lastName}</span>
                            </p>
                        )}

                        {(address.phone || address.company) && (
                            <p className="address-entry">
                                <span className="company-name">{`${address.company} `}</span>
                                <span className="tel">{address.phone}</span>
                            </p>
                        )}

                        <div className="adr">
                            <p className="street-address address-entry">
                                <span className="address-line-1">{`${address.address1} `}</span>
                                {address.address2 && (
                                    <span className="address-line-2">{` / ${address.address2}`}</span>
                                )}
                            </p>

                            <p className="address-entry">
                                {address.city && <span className="locality">{`${address.city}, `}</span>}
                                {address.localizedProvince && (
                                    <span className="region">{`${address.localizedProvince}, `}</span>
                                )}
                                {address.postalCode && (
                                    <span className="postal-code">{`${address.postalCode} / `}</span>
                                )}
                                {address.localizedCountry && (
                                    <span className="country-name">{`${address.localizedCountry} `}</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <PoweredByPayPalFastlaneLabel />
                </div>

                <div className="stepHeader-actions subheader">
                    <Button
                        onClick={handleEditButtonClick}
                        size={ButtonSize.Tiny}
                        testId="step-edit-button"
                        variant={ButtonVariant.Secondary}
                    >
                        <TranslatedString id="common.edit_action" />
                    </Button>
                </div>
            </div>

            {shouldShowCustomFormFields && (
                <Fieldset id="customFieldset">
                    {customFormFields.map((field) => (
                        <DynamicFormField
                            field={field}
                            key={`${field.id}-${field.name}`}
                            onChange={handleFieldValueChange(field.name)}
                            parentFieldName="shippingAddress.customFields"
                        />
                    ))}
                </Fieldset>
            )}
        </LoadingOverlay>
    );
}

export default memo(PayPalFastlaneShippingAddressForm);
