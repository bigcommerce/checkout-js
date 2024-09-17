import { PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';

export function getPaymentFormServiceMock(): PaymentFormService {
    return {
        disableSubmit: jest.fn(),
        getFieldValue: jest.fn(),
        getFormValues: jest.fn(),
        hidePaymentSubmitButton: jest.fn(),
        isSubmitted: jest.fn(),
        setFieldTouched: jest.fn(),
        setFieldValue: jest.fn(),
        setSubmit: jest.fn(),
        setSubmitted: jest.fn(),
        setValidationSchema: jest.fn(),
        submitForm: jest.fn(),
        validateForm: jest.fn(),
    };
}
