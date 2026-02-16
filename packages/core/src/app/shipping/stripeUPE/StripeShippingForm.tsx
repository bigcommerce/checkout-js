import {
  type Address,
  type CheckoutParams,
  type CheckoutSelectors,
  type FormField,
  type RequestOptions,
} from '@bigcommerce/checkout-sdk';
import { type FormikProps } from 'formik';
import { noop } from 'lodash';
import React, { useCallback, useState } from 'react';
import { lazy, object } from 'yup';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';

import {
  type AddressFormValues,
  getAddressFormFieldsValidationSchema,
  getTranslateAddressError,
  mapAddressToFormValues,
} from '../../address';
import type CheckoutStepStatus from '../../checkout/CheckoutStepStatus';
import { withFormikExtended } from '../../common/form';
import { EMPTY_ARRAY } from '../../common/utility';
import { getCustomFormFieldsValidationSchema } from '../../formFields';
import { Fieldset, Form } from '../../ui/form';
import BillingSameAsShippingField from '../BillingSameAsShippingField';
import hasSelectedShippingOptions from '../hasSelectedShippingOptions';
import ShippingFormFooter from '../ShippingFormFooter';

import StripeShippingAddress from './StripeShippingAddress';

export interface SingleShippingFormProps {
  isBillingSameAsShipping: boolean;
  cartHasChanged: boolean;
  customerMessage: string;
  isLoading: boolean;
  isShippingMethodLoading: boolean;
  isMultiShippingMode: boolean;
  methodId?: string;
  shippingAddress?: Address;
  shouldShowOrderComments: boolean;
  step: CheckoutStepStatus;
  isInitialValueLoaded: boolean;
  isStripeLoading?(): void;
  isStripeAutoStep?(): void;
  getFields(countryCode?: string): FormField[];
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

const StripeShippingForm: React.FC<SingleShippingFormProps & WithLanguageProps & FormikProps<SingleShippingFormValues>> = (props) => {
  const { checkoutService, checkoutState } = useCheckout();
  const {
    data: {
      getConsignments,
      getShippingCountries,
    },
  } = checkoutState;

  const consignments = getConsignments() || [];
  const initialize = checkoutService.initializeShipping;
  const deinitialize = checkoutService.deinitializeShipping;
  const countries = getShippingCountries() || EMPTY_ARRAY;

  const [isUpdatingShippingData] = useState(false);

  const {
    cartHasChanged,
    isInitialValueLoaded,
    isLoading,
    isStripeLoading,
    shippingAddress,
    shouldShowOrderComments,
    isValid,
    onSubmit,
    isStripeAutoStep,
    step,
    isShippingMethodLoading,
    updateAddress,
    onUnhandledError = noop,
    values,
    setValues,
    getFields,
  } = props;

  const shouldDisableSubmit = () => {
    if (!isValid) {
      return false;
    }

    return isLoading || isUpdatingShippingData || !hasSelectedShippingOptions(consignments);
  };

  const handleAddressSelect = useCallback(async (address: Address) => {
    try {
      await updateAddress(address);

      setValues({
        ...values,
        shippingAddress: mapAddressToFormValues(
          getFields(address.countryCode),
          address,
        ),
      });
    } catch (error) {
      onUnhandledError(error);
    }
  }, [values, setValues, onUnhandledError]);

  return (
    <Form autoComplete="on">
      <Fieldset>
        <StripeShippingAddress
          consignments={consignments}
          countries={countries}
          deinitialize={deinitialize}
          initialize={initialize}
          isShippingMethodLoading={isShippingMethodLoading}
          isStripeAutoStep={isStripeAutoStep}
          isStripeLoading={isStripeLoading}
          onAddressSelect={handleAddressSelect}
          onSubmit={onSubmit}
          shippingAddress={shippingAddress}
          shouldDisableSubmit={shouldDisableSubmit()}
          step={step}
        />

        <div className="form-body">
          <BillingSameAsShippingField />
        </div>
      </Fieldset>

      <ShippingFormFooter
        cartHasChanged={cartHasChanged}
        isInitialValueLoaded={isInitialValueLoaded}
        isLoading={isLoading || isUpdatingShippingData}
        isMultiShippingMode={false}
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
        getFields(shippingAddress && shippingAddress.countryCode),
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
      methodId
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
            }),
          ),
        }),
    enableReinitialize: false,
  })(StripeShippingForm),
);
