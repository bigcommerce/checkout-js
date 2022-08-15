import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import {
  PaymentMethodProps as ResolvedPaymentMethodProps,
  PaymentFormValues,
} from '@bigcommerce/checkout/payment-integration-api';
import React, { ComponentType } from 'react';

import { withCheckout, WithCheckoutProps } from '../../checkout';
import { connectFormik, WithFormikProps } from '../../common/form';
import { withLanguage, WithLanguageProps } from '../../locale';
import { withForm, WithFormProps } from '../../ui/form';
import createPaymentFormService from '../createPaymentFormService';
import resolvePaymentMethod, { PaymentMethodResolveId } from '../resolvePaymentMethod';
import withPayment, { WithPaymentProps } from '../withPayment';

export interface PaymentMethodProps {
  method: PaymentMethod;
  resolveComponent?(query: PaymentMethodResolveId): ComponentType<ResolvedPaymentMethodProps>;
  onUnhandledError(error: Error): void;
}

const PaymentMethodContainer: ComponentType<
  PaymentMethodProps &
    WithCheckoutProps &
    WithLanguageProps &
    WithPaymentProps &
    WithFormProps &
    WithFormikProps<PaymentFormValues>
> = ({
  formik: formikContext,
  checkoutService,
  checkoutState,
  disableSubmit,
  hidePaymentSubmitButton,
  isSubmitted,
  language,
  method,
  onUnhandledError,
  resolveComponent = resolvePaymentMethod,
  setSubmit,
  setSubmitted,
  setValidationSchema,
}) => {
  const formContext = {
    isSubmitted,
    setSubmitted,
  };

  const paymentContext = {
    disableSubmit,
    hidePaymentSubmitButton,
    setSubmit,
    setValidationSchema,
  };

  const ResolvedPaymentMethod = resolveComponent({
    id: method.id,
    gateway: method.gateway,
    type: method.type,
  });

  if (!ResolvedPaymentMethod) {
    return null;
  }

  return (
    <ResolvedPaymentMethod
      checkoutService={ checkoutService }
      checkoutState={ checkoutState }
      language={ language }
      method={ method }
      onUnhandledError={ onUnhandledError }
      paymentForm={ createPaymentFormService(formikContext, formContext, paymentContext) }
    />
  );
};

export default withCheckout((props) => props)(
  withLanguage(withPayment(withForm(connectFormik(PaymentMethodContainer)))),
) as ComponentType<PaymentMethodProps>;
