import {
    type Address,
    type CustomerAddress,
    type FormField,
    isExtraField,
} from '@bigcommerce/checkout-sdk/essential';
import { type FormikProps, withFormik } from 'formik';
import React, { type RefObject, useRef, useState } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import {
    TranslatedString,
    withLanguage,
    type WithLanguageProps,
} from '@bigcommerce/checkout/locale';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';
import {
    AddressFormSkeleton,
    Button,
    ButtonVariant,
    Fieldset,
    Form,
    LoadingOverlay,
} from '@bigcommerce/checkout/ui';

import {
    AddressForm,
    AddressSelect,
    AddressType,
    encodeAddressForWrite,
    isValidCustomerAddress,
    useAddressLabelDecoder,
} from '../address';
import { OrderComments } from '../orderComments';
import { getShippableItemsCount } from '../shipping';

import {
    type BillingFormValues,
    getBillingFormInitialValues,
    getBillingFormValidationSchema,
} from './billingFormConfig';
import StaticBillingAddress from './StaticBillingAddress';

export type { BillingFormValues } from './billingFormConfig';

export interface BillingFormProps {
    methodId?: string;
    billingAddress?: Address;
    customerMessage: string;
    navigateNextStep(): void;
    onSubmit(values: BillingFormValues): void;
    onUnhandledError(error: Error): void;
    getFields(countryCode?: string): FormField[];
}

const BillingForm = ({
    methodId,
    getFields,
    billingAddress,
    setFieldValue,
    values,
    onUnhandledError,
}: BillingFormProps & WithLanguageProps & FormikProps<BillingFormValues>) => {
    const [isResettingAddress, setIsResettingAddress] = useState(false);
    const addressFormRef: RefObject<HTMLFieldSetElement> = useRef(null);
    const { isPayPalFastlaneEnabled, paypalFastlaneAddresses } = usePayPalFastlaneAddress();

    const {
        checkoutService,
        selectedState: { customer, config, cart, isUpdatingBillingAddress, isUpdatingCheckout },
    } = useCheckout(({ data, statuses }) => ({
        customer: data.getCustomer(),
        config: data.getConfig(),
        cart: data.getCart(),
        isUpdatingBillingAddress: statuses.isUpdatingBillingAddress(),
        isUpdatingCheckout: statuses.isUpdatingCheckout(),
    }));
    const {
        billing: { hideSaveToAddressBookCheck, restrictManualAddressEntry },
        userJourney: { hasAddressLabel },
    } = useCapabilities();
    const decode = useAddressLabelDecoder();

    if (!config || !customer || !cart) {
        throw new Error('checkout data is not available');
    }

    const isGuest = customer.isGuest;
    const rawAddresses = customer.addresses;
    const shouldRenderStaticAddress = methodId === 'amazonpay';
    const allFormFields = getFields(values.countryCode);
    const customOrExtraFields = allFormFields.filter(
        (field) => field.custom || isExtraField(field),
    );
    const hasCustomOrExtraFields = customOrExtraFields.length > 0;
    const editableFormFields =
        shouldRenderStaticAddress && hasCustomOrExtraFields ? customOrExtraFields : allFormFields;
    const rawBillingAddresses =
        isGuest && isPayPalFastlaneEnabled ? paypalFastlaneAddresses : rawAddresses;

    const billingAddresses = rawBillingAddresses.map(decode);
    const decodedBillingAddress = decode(billingAddress);

    const hasAddresses = rawBillingAddresses.length > 0;
    const hasValidCustomerAddress =
        decodedBillingAddress &&
        isValidCustomerAddress(
            decodedBillingAddress,
            billingAddresses,
            getFields(decodedBillingAddress.countryCode),
        );
    const isUpdating = isUpdatingBillingAddress || isUpdatingCheckout;
    const { enableOrderComments } = config.checkoutSettings;
    const shouldShowOrderComments = enableOrderComments && getShippableItemsCount(cart) < 1;
    const shouldShowSaveAddress = !hideSaveToAddressBookCheck && !isGuest;

    const handleSelectAddress = async (address: Partial<Address>) => {
        setIsResettingAddress(true);

        const prepared = hasAddressLabel
            ? encodeAddressForWrite(decode(address as CustomerAddress))
            : address;

        try {
            await checkoutService.updateBillingAddress(prepared);
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        } finally {
            setIsResettingAddress(false);
        }
    };

    const handleUseNewAddress = () => {
        void handleSelectAddress({});
    };

    return (
        <Form autoComplete="on">
            {shouldRenderStaticAddress && billingAddress && (
                <div className="form-fieldset">
                    <StaticBillingAddress address={billingAddress} />
                </div>
            )}

            <Fieldset id="checkoutBillingAddress" ref={addressFormRef}>
                {hasAddresses && !shouldRenderStaticAddress && (
                    <Fieldset id="billingAddresses">
                        <LoadingOverlay isLoading={isResettingAddress}>
                            <AddressSelect
                                addresses={billingAddresses}
                                onSelectAddress={handleSelectAddress}
                                onUseNewAddress={handleUseNewAddress}
                                selectedAddress={
                                    hasValidCustomerAddress ? decodedBillingAddress : undefined
                                }
                                type={AddressType.Billing}
                            />
                        </LoadingOverlay>
                    </Fieldset>
                )}

                {!restrictManualAddressEntry && !hasValidCustomerAddress && (
                    <AddressFormSkeleton isLoading={isResettingAddress}>
                        <AddressForm
                            countryCode={values.countryCode}
                            formFields={editableFormFields}
                            setFieldValue={setFieldValue}
                            shouldShowSaveAddress={shouldShowSaveAddress}
                            type={AddressType.Billing}
                        />
                    </AddressFormSkeleton>
                )}
            </Fieldset>

            {shouldShowOrderComments && <OrderComments />}

            <div className="form-actions">
                <Button
                    className="body-bold"
                    disabled={isUpdating || isResettingAddress}
                    id="checkout-billing-continue"
                    isLoading={isUpdating || isResettingAddress}
                    type="submit"
                    variant={ButtonVariant.Primary}
                >
                    <TranslatedString id="common.continue_action" />
                </Button>
            </div>
        </Form>
    );
};

export default withLanguage(
    withFormik<BillingFormProps & WithLanguageProps, BillingFormValues>({
        handleSubmit: (values, { props: { onSubmit } }) => {
            onSubmit(values);
        },
        mapPropsToValues: ({ getFields, customerMessage, billingAddress }) =>
            getBillingFormInitialValues(getFields, billingAddress, customerMessage),
        validateOnMount: true,
        validationSchema: ({
            language,
            getFields,
            methodId,
        }: BillingFormProps & WithLanguageProps) =>
            getBillingFormValidationSchema(language, getFields, methodId),
        enableReinitialize: true,
    })(BillingForm),
);
