import {
    type Address,
    type CheckoutParams,
    type CheckoutSelectors,
    type Consignment,
    type CustomerRequestOptions,
    type FormField,
    type RequestOptions,
    type ShippingInitializeOptions,
    type ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { type FormikProps } from 'formik';
import { debounce, isEqual, noop } from 'lodash';
import React, { PureComponent, type ReactNode } from 'react';
import { lazy, object } from 'yup';

import { withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { FormContext } from '@bigcommerce/checkout/ui';

import {
    type AddressFormValues,
    getAddressFormFieldsValidationSchema,
    getTranslateAddressError,
    isEqualAddress,
    mapAddressFromFormValues,
    mapAddressToFormValues,
} from '../address';
import { isErrorWithType } from '../common/error';
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
    isMultiShippingMode: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shippingAutosaveDelay?: number;
    shouldShowOrderComments: boolean;
    isInitialValueLoaded: boolean;
    shippingFormRenderTimestamp?: number;
    validateMaxLength: boolean;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    deleteConsignments(): Promise<Address | undefined>;
    getFields(countryCode?: string): FormField[];
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onSubmit(values: SingleShippingFormValues): void;
    onUnhandledError?(error: Error): void;
    signOut(options?: CustomerRequestOptions): void;
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

interface SingleShippingFormState {
    isResettingAddress: boolean;
    isUpdatingShippingData: boolean;
    hasRequestedShippingOptions: boolean;
}

function shouldHaveCustomValidation(methodId?: string): boolean {
    const methodIdsWithoutCustomValidation: string[] = [
        PaymentMethodId.BraintreeAcceleratedCheckout,
        PaymentMethodId.PayPalCommerceAcceleratedCheckout,
    ];

    return Boolean(methodId && !methodIdsWithoutCustomValidation.includes(methodId));
}

export const SHIPPING_AUTOSAVE_DELAY = 1700;

class SingleShippingForm extends PureComponent<
    SingleShippingFormProps & WithLanguageProps & FormikProps<SingleShippingFormValues>
> {
    static contextType = FormContext;

    state: SingleShippingFormState = {
        isResettingAddress: false,
        isUpdatingShippingData: false,
        hasRequestedShippingOptions: false,
    };

    private debouncedUpdateAddress: any;

    constructor(
        props: SingleShippingFormProps & WithLanguageProps & FormikProps<SingleShippingFormValues>,
    ) {
        super(props);

        const { updateAddress, onUnhandledError = noop } = this.props;

        this.debouncedUpdateAddress = debounce(
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
                        this.setState({ hasRequestedShippingOptions: true });
                    }
                } catch (error) {
                    if (isErrorWithType(error) && error.type === 'empty_cart') {
                        return onUnhandledError(error);
                    }
                } finally {
                    this.setState({ isUpdatingShippingData: false });
                }
            },
            props.shippingAutosaveDelay ?? SHIPPING_AUTOSAVE_DELAY,
        );
    }

    componentDidUpdate({ shippingFormRenderTimestamp }: SingleShippingFormProps) {
        const {
            shippingFormRenderTimestamp: newShippingFormRenderTimestamp,
            setValues,
            getFields,
            shippingAddress,
            isBillingSameAsShipping,
            customerMessage,
            values,
            setFieldValue,
        } = this.props;

        const stateOrProvinceCodeFormField = getFields(values && values.shippingAddress?.countryCode).find(
            ({ name }) => name === 'stateOrProvinceCode',
        );

        // Workaround for a bug found during manual testing:
        // When the shipping step first loads, the `stateOrProvinceCode` field may not be there.
        // It later appears with an empty value if the selected country has states/provinces.
        // To address this, we manually set `stateOrProvinceCode` in Formik.
        if (
            stateOrProvinceCodeFormField &&
            shippingAddress?.stateOrProvinceCode &&
            !values.shippingAddress?.stateOrProvinceCode
        ) {
            setFieldValue('shippingAddress.stateOrProvinceCode', shippingAddress.stateOrProvinceCode);
        }

        // This is for executing extension command, `ReRenderShippingForm`.
        if (newShippingFormRenderTimestamp !== shippingFormRenderTimestamp) {
            setValues({
                billingSameAsShipping: isBillingSameAsShipping,
                orderComment: customerMessage,
                shippingAddress: mapAddressToFormValues(
                    getFields(shippingAddress && shippingAddress.countryCode),
                    shippingAddress,
                ),
            });
        }
    }

    render(): ReactNode {
        const {
            cartHasChanged,
            isInitialValueLoaded,
            isLoading,
            onUnhandledError,
            methodId,
            shippingAddress,
            consignments,
            shouldShowOrderComments,
            initialize,
            isValid,
            deinitialize,
            values: { shippingAddress: addressForm },
            isShippingStepPending,
            shippingFormRenderTimestamp,
            validateMaxLength,
        } = this.props;

        const { isResettingAddress, isUpdatingShippingData, hasRequestedShippingOptions } =
            this.state;

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
                        formFields={this.getFields(addressForm && addressForm.countryCode)}
                        hasRequestedShippingOptions={hasRequestedShippingOptions}
                        initialize={initialize}
                        isLoading={isResettingAddress}
                        isShippingStepPending={isShippingStepPending}
                        methodId={methodId}
                        onAddressSelect={this.handleAddressSelect}
                        onFieldChange={this.handleFieldChange}
                        onUnhandledError={onUnhandledError}
                        onUseNewAddress={this.onUseNewAddress}
                        shippingAddress={shippingAddress}
                        validateMaxLength={validateMaxLength}
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
                    shouldDisableSubmit={this.shouldDisableSubmit()}
                    shouldShowOrderComments={shouldShowOrderComments}
                    shouldShowShippingOptions={isValid}
                />
            </Form>
        );
    }

    private shouldDisableSubmit: () => boolean = () => {
        const { isLoading, consignments, isValid } = this.props;

        const { isUpdatingShippingData } = this.state;

        if (!isValid) {
            return false;
        }

        return isLoading || isUpdatingShippingData || !hasSelectedShippingOptions(consignments) || !isSelectedShippingOptionValid(consignments);
    };

    private handleFieldChange: (name: string) => void = async (name) => {
        const { setFieldValue } = this.props;

        if (name === 'countryCode') {
            setFieldValue('shippingAddress.stateOrProvince', '');
            setFieldValue('shippingAddress.stateOrProvinceCode', '');
        }

        // Enqueue the following code to run after Formik has run validation
        await new Promise((resolve) => setTimeout(resolve));

        const isShippingField = SHIPPING_ADDRESS_FIELDS.includes(name);

        const { hasRequestedShippingOptions } = this.state;

        const { isValid } = this.props;

        if (!isValid) {
            return;
        }

        this.updateAddressWithFormData(isShippingField || !hasRequestedShippingOptions);
    };

    private updateAddressWithFormData(includeShippingOptions: boolean) {
        const {
            shippingAddress,
            values: { shippingAddress: addressForm },
        } = this.props;

        const updatedShippingAddress = addressForm && mapAddressFromFormValues(addressForm);

        if (Array.isArray(shippingAddress?.customFields)) {
            includeShippingOptions = !isEqual(
                shippingAddress?.customFields,
                updatedShippingAddress?.customFields
            ) || includeShippingOptions;
        }

        if (!updatedShippingAddress || isEqualAddress(updatedShippingAddress, shippingAddress)) {
            return;
        }

        this.setState({ isUpdatingShippingData: true });
        this.debouncedUpdateAddress(updatedShippingAddress, includeShippingOptions);
    }

    private handleAddressSelect: (address: Address) => void = async (address) => {
        const { updateAddress, onUnhandledError = noop, values, setValues } = this.props;

        this.setState({ isResettingAddress: true });

        try {
            await updateAddress(address);

            setValues({
                ...values,
                shippingAddress: mapAddressToFormValues(
                    this.getFields(address.countryCode),
                    address,
                ),
            });
        } catch (error) {
            onUnhandledError(error);
        } finally {
            this.setState({ isResettingAddress: false });
        }
    };

    private onUseNewAddress: () => void = async () => {
        const { deleteConsignments, onUnhandledError = noop, setValues, values } = this.props;

        this.setState({ isResettingAddress: true });

        try {
            const address = await deleteConsignments();

            setValues({
                ...values,
                shippingAddress: mapAddressToFormValues(
                    this.getFields(address && address.countryCode),
                    address,
                ),
            });
        } catch (e) {
            onUnhandledError(e);
        } finally {
            this.setState({ isResettingAddress: false });
        }
    };

    private getFields(countryCode: string | undefined): FormField[] {
        const { getFields } = this.props;

        return getFields(countryCode);
    }
}

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
                getFields(shippingAddress && shippingAddress.countryCode),
                shippingAddress,
            ),
        }),
        isInitialValid: ({ shippingAddress, getFields, language, validateMaxLength }) =>
            !!shippingAddress &&
            getAddressFormFieldsValidationSchema({
                language,
                formFields: getFields(shippingAddress.countryCode),
                validateMaxLength,
            }).isValidSync(shippingAddress),
        validationSchema: ({
            language,
            getFields,
            methodId,
            validateMaxLength,
        }: SingleShippingFormProps & WithLanguageProps) =>
            shouldHaveCustomValidation(methodId)
                ? object({
                      shippingAddress: lazy<Partial<AddressFormValues>>((formValues) =>
                          getCustomFormFieldsValidationSchema({
                              translate: getTranslateAddressError(getFields(formValues && formValues.countryCode), language),
                              formFields: getFields(formValues && formValues.countryCode),
                          }),
                      ),
                  })
                : object({
                      shippingAddress: lazy<Partial<AddressFormValues>>((formValues) =>
                          getAddressFormFieldsValidationSchema({
                              language,
                              formFields: getFields(formValues && formValues.countryCode),
                              validateMaxLength,
                          }),
                      ),
                  }),
        enableReinitialize: false, // This is false due to the concern that a shopper may lose typed details if somehow checkout state changes in the middle.
    })(SingleShippingForm),
);
