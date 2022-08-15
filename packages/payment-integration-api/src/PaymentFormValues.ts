interface PaymentFormCommonValues {
  paymentProviderRadio: string; // TODO: Give this property a better name. We need to keep it for now because of legacy reasons.
  terms?: boolean;
}

interface HostedWidgetPaymentMethodValues {
  shouldSaveInstrument: boolean;
}

interface AccountCreationValues {
  shouldCreateAccount: boolean;
}

export interface IdealCustomFormFieldsetValues {
  bic: string;
}

export interface SepaCustomFormFieldsetValues {
  iban: string;
  sepaMandate: boolean;
}

export interface FawryCustomFormFieldsetValues {
  customerMobile: string;
  customerEmail: string;
}

export interface DocumentOnlyCustomFormFieldsetValues {
  ccDocument?: string;
}

export interface HostedCreditCardFieldsetValues {
  hostedForm: {
    cardType?: string;
    errors?: {
      cardCode?: string;
      cardExpiry?: string;
      cardName?: string;
      cardNumber?: string;
    };
  };
}

export interface CreditCardFieldsetValues {
  ccCustomerCode?: string;
  ccCvv?: string;
  ccExpiry: string;
  ccName: string;
  ccNumber: string;
  shouldSaveInstrument?: boolean;
}

interface CreditCardValidationValues {
  ccCvv?: string;
  ccNumber?: string;
}

export type CardInstrumentFieldsetValues =
  | ({
      instrumentId: string;
    } & CreditCardValidationValues)
  | HostedCreditCardValidationValues;

export interface HostedCreditCardValidationValues {
  hostedForm: {
    errors?: {
      cardCodeVerification?: string;
      cardNumberVerification?: string;
    };
  };
}

type PaymentFormValues =
  | (CreditCardFieldsetValues & PaymentFormCommonValues)
  | (CardInstrumentFieldsetValues & PaymentFormCommonValues)
  | (HostedCreditCardFieldsetValues & PaymentFormCommonValues)
  | (HostedWidgetPaymentMethodValues & PaymentFormCommonValues)
  | (DocumentOnlyCustomFormFieldsetValues & PaymentFormCommonValues)
  | (SepaCustomFormFieldsetValues & PaymentFormCommonValues)
  | (FawryCustomFormFieldsetValues & PaymentFormCommonValues)
  | (IdealCustomFormFieldsetValues & PaymentFormCommonValues)
  | (AccountCreationValues & PaymentFormCommonValues)
  | PaymentFormCommonValues;
export default PaymentFormValues;
