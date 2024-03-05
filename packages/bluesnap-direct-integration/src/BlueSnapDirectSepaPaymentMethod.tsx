import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import {
    AccountInstrumentFieldset,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { CheckboxFormField, Fieldset, Legend, LoadingOverlay } from '@bigcommerce/checkout/ui';

import { isBlueSnapDirectInitializationData } from './BlueSnapDirectInitializationData';
import BlueSnapDirectTextField from './fields/BlueSnapDirectTextField';
import useSepaInstruments from './hooks/useSepaInstruments';
import getSepaValidationSchema from './validation-schemas/getSepaValidationSchema';

const BlueSnapDirectSepaPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const {
        method,
        checkoutService: { initializePayment, deinitializePayment, loadInstruments },
        checkoutState: {
            data: { isPaymentDataRequired },
            statuses: { isLoadingInstruments },
        },
        paymentForm: { disableSubmit, setValidationSchema },
        language,
        onUnhandledError,
    } = props;

    if (!isBlueSnapDirectInitializationData(method.initializationData)) {
        throw new Error('Unable to get initialization data');
    }

    const [disabled, setDisabled] = useState(true);
    const toggleSubmitButton = useCallback(
        (shopperPermission: boolean) => setDisabled(!shopperPermission),
        [setDisabled],
    );

    useEffect(
        () => disableSubmit(method, isPaymentDataRequired() && disabled),
        [disableSubmit, disabled, isPaymentDataRequired, method],
    );

    const initializeSepa = useCallback(async () => {
        await initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [initializePayment, method]);

    const deinitializeSepa = useCallback(async () => {
        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [deinitializePayment, method.gateway, method.id]);

    useEffect(() => {
        void initializeSepa();

        return () => {
            void deinitializeSepa();
        };
    }, [deinitializeSepa, initializeSepa]);

    const {
        accountInstruments,
        currentInstrument,
        handleSelectInstrument,
        handleUseNewInstrument,
        isInstrumentFeatureAvailable,
        shouldShowInstrumentFieldset,
        shouldCreateNewInstrument,
    } = useSepaInstruments(method);

    const shouldShowForm = !shouldShowInstrumentFieldset || shouldCreateNewInstrument;

    useEffect(() => {
        setValidationSchema(method, getSepaValidationSchema(language, shouldShowForm));
    }, [language, shouldShowForm, setValidationSchema, method]);

    useEffect(() => {
        const loadInstrumentsOrThrow = async () => {
            try {
                await loadInstruments();
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        if (isInstrumentFeatureAvailable) {
            void loadInstrumentsOrThrow();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isLoading = isLoadingInstruments();

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
            <Fieldset
                legend={
                    <Legend hidden>
                        {language.translate('payment.bluesnap_direct_sepa_direct_debit')}
                    </Legend>
                }
                style={{ paddingBottom: '1rem' }}
            >
                {shouldShowInstrumentFieldset && (
                    <div className="checkout-ach-form__instrument">
                        <AccountInstrumentFieldset
                            instruments={accountInstruments}
                            onSelectInstrument={handleSelectInstrument}
                            onUseNewInstrument={handleUseNewInstrument}
                            selectedInstrument={currentInstrument}
                        />
                    </div>
                )}
                {shouldShowForm && (
                    <>
                        <BlueSnapDirectTextField
                            autoComplete="iban"
                            labelContent={language.translate('payment.bluesnap_direct_iban.label')}
                            name="iban"
                            useFloatingLabel={true}
                        />
                        <BlueSnapDirectTextField
                            labelContent={language.translate('address.first_name_label')}
                            name="firstName"
                            useFloatingLabel={true}
                        />
                        <BlueSnapDirectTextField
                            labelContent={language.translate('address.last_name_label')}
                            name="lastName"
                            useFloatingLabel={true}
                        />
                    </>
                )}

                <CheckboxFormField
                    labelContent={language.translate(
                        'payment.bluesnap_direct_sepa_mandate_disclaimer',
                        {
                            creditorName: method.initializationData.sepaCreditorCompanyName,
                        },
                    )}
                    name="shopperPermission"
                    onChange={toggleSubmitButton}
                />

                {isInstrumentFeatureAvailable && (
                    <StoreInstrumentFieldset
                        instrumentId={currentInstrument?.bigpayToken}
                        instruments={accountInstruments}
                        isAccountInstrument
                    />
                )}
            </Fieldset>
        </LoadingOverlay>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BlueSnapDirectSepaPaymentMethod,
    [{ id: 'sepa_direct_debit', gateway: 'bluesnapdirect' }],
);
