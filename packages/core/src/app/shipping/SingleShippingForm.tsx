import {
    type Address,
    type CheckoutParams,
    type CheckoutSelectors,
    type Consignment,
    type FormField,
    type RequestOptions,
    type ShippingInitializeOptions,
    type ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { type FormikProps } from 'formik';
import { debounce, isEqual, noop } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { lazy, object } from 'yup';

import { withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';

import {
    type AddressFormValues,
    getAddressFormFieldsValidationSchema,
    getTranslateAddressError,
    isEqualAddress,
    mapAddressFromFormValues,
    mapAddressToFormValues,
} from '../address';
import { withFormikExtended } from '../common/form';
import { getCustomFormFieldsValidationSchema } from '../formFields';
import { PaymentMethodId } from '../payment/paymentMethod';
import { Fieldset, Form } from '../ui/form';

import BillingSameAsShippingField from './BillingSameAsShippingField';
import hasSelectedShippingOptions from './hasSelectedShippingOptions';
import isSelectedShippingOptionValid from './isSelectedShippingOptionValid';
import ShippingAddress from './ShippingAddress';
import { SHIPPING_ADDRESS_FIELDS } from './ShippingAddressFields';
import ShippingFormFooter from './ShippingFormFooter';

export interface SingleShippingFormProps {
    isBillingSameAsShipping: boolean;
    cartHasChanged: boolean;
    consignments: Consignment[];
    customerMessage: string;
    isLoading: boolean;
    isShippingStepPending: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shippingAutosaveDelay?: number;
    shouldShowOrderComments: boolean;
    isInitialValueLoaded: boolean;
    shippingFormRenderTimestamp?: number;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    deleteConsignments(): Promise<Address | undefined>;
    getFields(countryCode?: string): FormField[];
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onSubmit(values: SingleShippingFormValues): void;
    onUnhandledError?(error: Error): void;
    updateAddress(
        address: Partial<Address>,
        options?: RequestOptions<CheckoutParams>,
    ): Promise<CheckoutSelectors>;
}

export interface SingleShippingFormValues {
    billingSameAsShipping: boolean;
    shippingAddress?: AddressFormValues;
    orderComment: string;
}

function shouldHaveCustomValidation(methodId?: string): boolean {
    const methodIdsWithoutCustomValidation: string[] = [
        PaymentMethodId.BraintreeAcceleratedCheckout,
        PaymentMethodId.PayPalCommerceAcceleratedCheckout,
    ];

    return Boolean(methodId && !methodIdsWithoutCustomValidation.includes(methodId));
}

export const SHIPPING_AUTOSAVE_DELAY = 1700;

const SingleShippingForm: React.FC<
    SingleShippingFormProps & WithLanguageProps & FormikProps<SingleShippingFormValues>
> = ({
        cartHasChanged,
        consignments,
        customerMessage,
        deinitialize,
        deleteConsignments,
        getFields,
        initialize,
        isBillingSameAsShipping,
        isInitialValueLoaded,
        isLoading,
        isShippingStepPending,
        isValid,
        validateForm,
        methodId,
        onUnhandledError = noop,
        setFieldValue,
        setValues,
        shippingAddress,
        shippingAutosaveDelay = SHIPPING_AUTOSAVE_DELAY,
        shippingFormRenderTimestamp,
        shouldShowOrderComments,
        updateAddress,
        values,
    }) => {
    const [isResettingAddress, setIsResettingAddress] = useState(false);
    const [isUpdatingShippingData, setIsUpdatingShippingData] = useState(false);
    const [hasRequestedShippingOptions, setHasRequestedShippingOptions] = useState(false);

    const debouncedUpdateAddressRef = useRef<any>();

    useEffect(() => {
        debouncedUpdateAddressRef.current = debounce(
            async (address: Address, includeShippingOptions: boolean) => {
                try {
                    await updateAddress(address, {
                        params: {
                            include: {
                                'consignments.availableShippingOptions': includeShippingOptions,
                            },
                        },
                    });

                    if (includeShippingOptions) {
                        setHasRequestedShippingOptions(true);
                    }
                } finally {
                    setIsUpdatingShippingData(false);
                }
            },
            shippingAutosaveDelay,
        );

        return () => {
            debouncedUpdateAddressRef.current?.cancel();
        };
    }, [updateAddress, shippingAutosaveDelay]);

    const updateAddressWithFormData = useCallback(
        (includeShippingOptions: boolean) => {
            const updatedShippingAddress =
                values.shippingAddress && mapAddressFromFormValues(values.shippingAddress);

            let newIncludeShippingOptions = includeShippingOptions;

            if (Array.isArray(shippingAddress?.customFields)) {
                newIncludeShippingOptions =
                    !isEqual(shippingAddress?.customFields, updatedShippingAddress?.customFields) ||
                    includeShippingOptions;
            }

            if (!updatedShippingAddress || isEqualAddress(updatedShippingAddress, shippingAddress)) {
                return;
            }

            setIsUpdatingShippingData(true);
            debouncedUpdateAddressRef.current?.(updatedShippingAddress, newIncludeShippingOptions);
        },
        [shippingAddress, values.shippingAddress],
    );

    const handleFieldChange = async (name: string) => {
        if (name === 'countryCode') {
            setFieldValue('shippingAddress.stateOrProvince', '');
            setFieldValue('shippingAddress.stateOrProvinceCode', '');
        }

        await new Promise((resolve) => setTimeout(resolve));

        const errors = await validateForm();
        const addressErrors = errors.shippingAddress;

        // Only update address if there are no address errors
        if (addressErrors && Object.keys(addressErrors).length > 0) {
            return;
        }

        const isShippingField = SHIPPING_ADDRESS_FIELDS.includes(name);

        updateAddressWithFormData(isShippingField || !hasRequestedShippingOptions);
    };

    useEffect(() => {
        const stateOrProvinceCodeFormField = getFields(
            values.shippingAddress?.countryCode,
        ).find(({ name }) => name === 'stateOrProvinceCode');

        if (
            stateOrProvinceCodeFormField &&
            shippingAddress?.stateOrProvinceCode &&
            !values.shippingAddress?.stateOrProvinceCode
        ) {
            setFieldValue('shippingAddress.stateOrProvinceCode', shippingAddress.stateOrProvinceCode);
        }
    }, [
        getFields,
        setFieldValue,
        shippingAddress?.stateOrProvinceCode,
        values.shippingAddress?.countryCode,
        values.shippingAddress?.stateOrProvinceCode,
    ]);

    useEffect(() => {
        if (shippingFormRenderTimestamp) {
            setValues({
                billingSameAsShipping: isBillingSameAsShipping,
                orderComment: customerMessage,
                shippingAddress: mapAddressToFormValues(
                    getFields(shippingAddress?.countryCode),
                    shippingAddress,
                ),
            });
        }
    }, [shippingFormRenderTimestamp]);

    const handleAddressSelect = useCallback(
        async (address: Address) => {
            setIsResettingAddress(true);

            try {
                await updateAddress(address);

                setValues({
                    ...values,
                    shippingAddress: mapAddressToFormValues(getFields(address.countryCode), address),
                });
            } catch (error) {
                onUnhandledError(error);
            } finally {
                setIsResettingAddress(false);
            }
        },
        [getFields, onUnhandledError, setValues, updateAddress, values],
    );

    const handleUseNewAddress = useCallback(async () => {
        setIsResettingAddress(true);

        try {
            const address = await deleteConsignments();

            setValues({
                ...values,
                shippingAddress: mapAddressToFormValues(getFields(address?.countryCode), address),
            });
        } catch (error) {
            onUnhandledError(error);
        } finally {
            setIsResettingAddress(false);
        }
    }, [deleteConsignments, getFields, onUnhandledError, setValues, values]);

    const shouldDisableSubmit = useCallback(() => {
        if (!isValid) {
            return false;
        }

        return (
            isLoading ||
            isUpdatingShippingData ||
            !hasSelectedShippingOptions(consignments) ||
            !isSelectedShippingOptionValid(consignments)
        );
    }, [consignments, isLoading, isUpdatingShippingData, isValid]);

    const PAYMENT_METHOD_VALID = ['amazonpay'];
    const shouldShowBillingSameAsShipping = !PAYMENT_METHOD_VALID.some(
        (method) => method === methodId,
    );

    return (
        <Form autoComplete="on">
            <Fieldset>
                <ShippingAddress
                    consignments={consignments}
                    deinitialize={deinitialize}
                    formFields={getFields(values.shippingAddress?.countryCode)}
                    hasRequestedShippingOptions={hasRequestedShippingOptions}
                    initialize={initialize}
                    isLoading={isResettingAddress}
                    isShippingStepPending={isShippingStepPending}
                    methodId={methodId}
                    onAddressSelect={handleAddressSelect}
                    onFieldChange={handleFieldChange}
                    onUnhandledError={onUnhandledError}
                    onUseNewAddress={handleUseNewAddress}
                    shippingAddress={shippingAddress}
                />
                {shouldShowBillingSameAsShipping && (
                    <div className="form-body">
                        <BillingSameAsShippingField />
                    </div>
                )}
            </Fieldset>

            <ShippingFormFooter
                cartHasChanged={cartHasChanged}
                isInitialValueLoaded={isInitialValueLoaded}
                isLoading={isLoading || isUpdatingShippingData}
                isMultiShippingMode={false}
                shippingFormRenderTimestamp={shippingFormRenderTimestamp}
                shouldDisableSubmit={shouldDisableSubmit()}
                shouldShowOrderComments={shouldShowOrderComments}
                shouldShowShippingOptions={isValid}
            />
        </Form>
    );
};

export default withLanguage(
    withFormikExtended<SingleShippingFormProps & WithLanguageProps, SingleShippingFormValues>({
        handleSubmit: (values, { props: { onSubmit } }) => {
            onSubmit(values);
        },
        mapPropsToValues: ({
            getFields,
            shippingAddress,
            isBillingSameAsShipping,
            customerMessage,
        }) => ({
            billingSameAsShipping: isBillingSameAsShipping,
            orderComment: customerMessage,
            shippingAddress: mapAddressToFormValues(
                getFields(shippingAddress?.countryCode),
                shippingAddress,
            ),
        }),
        isInitialValid: ({ shippingAddress, getFields, language }) =>
            !!shippingAddress &&
            getAddressFormFieldsValidationSchema({
                language,
                formFields: getFields(shippingAddress.countryCode),
            }).isValidSync(shippingAddress),
        validationSchema: ({
            language,
            getFields,
            methodId,
        }: SingleShippingFormProps & WithLanguageProps) =>
            shouldHaveCustomValidation(methodId)
                ? object({
                      shippingAddress: lazy<Partial<AddressFormValues>>((formValues) =>
                          getCustomFormFieldsValidationSchema({
                              translate: getTranslateAddressError(language),
                              formFields: getFields(formValues?.countryCode),
                          }),
                      ),
                  })
                : object({
                      shippingAddress: lazy<Partial<AddressFormValues>>((formValues) =>
                          getAddressFormFieldsValidationSchema({
                              language,
                              formFields: getFields(formValues?.countryCode),
                          }),
                      ),
                  }),
        enableReinitialize: false, // This is false due to the concern that a shopper may lose typed details if somehow checkout state changes in the middle.
    })(SingleShippingForm),
);
