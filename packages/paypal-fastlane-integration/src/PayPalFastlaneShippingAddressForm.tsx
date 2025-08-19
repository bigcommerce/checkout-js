import {
    type Address,
    type CheckoutSelectors,
    type Country,
    type CustomerAddress,
    type FormField,
    type ShippingInitializeOptions,
    type ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import React, { memo, type MutableRefObject } from 'react';

import { localizeAddress, TranslatedString } from '@bigcommerce/checkout/locale';
import {
    Button,
    ButtonSize,
    ButtonVariant,
    DynamicFormField,
    Fieldset,
    LoadingOverlay,
} from '@bigcommerce/checkout/ui';

import PoweredByPayPalFastlaneLabel from './PoweredByPayPalFastlaneLabel';

export interface PayPalFastlaneStaticAddressProps {
    address: Address;
    countries?: Country[];
    formFields: FormField[];
    isLoading: boolean;
    methodId: string;
    paypalFastlaneShippingComponentRef: MutableRefObject<PayPalFastlaneAddressComponentRef>;
    deinitialize(options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options?: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onAddressSelect(address: Address): void;
    onFieldChange(fieldName: string, value: string): void;
    onUnhandledError?(error: Error): void;
}

export interface PayPalFastlaneAddressComponentRef {
    showAddressSelector?: () => Promise<CustomerAddress | undefined>;
}

const PayPalFastlaneShippingAddressForm = (props: PayPalFastlaneStaticAddressProps) => {
    const {
        address: addressWithoutLocalization,
        formFields,
        isLoading,
        onAddressSelect,
        onFieldChange,
        countries,
        paypalFastlaneShippingComponentRef,
    } = props;
    const address = localizeAddress(addressWithoutLocalization, countries);

    const customFormFields = formFields.filter(({ custom }) => custom);
    const shouldShowCustomFormFields = customFormFields.length > 0;

    const handleFieldValueChange: (name: string) => (value: string) => void = (name) => (value) =>
        onFieldChange(name, value);

    const handleEditButtonClick = async () => {
        if (typeof paypalFastlaneShippingComponentRef.current.showAddressSelector === 'function') {
            const selectedAddress =
                await paypalFastlaneShippingComponentRef.current.showAddressSelector();

            if (selectedAddress) {
                const customFields = shouldShowCustomFormFields ? address.customFields : {};

                onAddressSelect({
                    ...selectedAddress,
                    ...customFields,
                });
            }
        }
    };

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
            <div className="stepHeader" style={{ padding: 0 }}>
                <div className="stepHeader-body subheader">
                    <div className="vcard checkout-address--static">
                        {!!(address.firstName || address.lastName) && (
                            <p className="fn address-entry">
                                <span className="first-name">{`${address.firstName} `}</span>
                                <span className="family-name">{address.lastName}</span>
                            </p>
                        )}

                        {!!(address.phone || address.company) && (
                            <p className="address-entry">
                                <span className="company-name">{`${address.company} `}</span>
                                <span className="tel">{address.phone}</span>
                            </p>
                        )}

                        <div className="adr">
                            <p className="street-address address-entry">
                                <span className="address-line-1">{`${address.address1} `}</span>
                                {!!address.address2 && (
                                    <span className="address-line-2">{` / ${address.address2}`}</span>
                                )}
                            </p>

                            <p className="address-entry">
                                {!!address.city && (
                                    <span className="locality">{`${address.city}, `}</span>
                                )}
                                {!!address.localizedProvince && (
                                    <span className="region">{`${address.localizedProvince}, `}</span>
                                )}
                                {!!address.postalCode && (
                                    <span className="postal-code">{`${address.postalCode} / `}</span>
                                )}
                                {!!address.localizedCountry && (
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
};

export default memo(PayPalFastlaneShippingAddressForm);
