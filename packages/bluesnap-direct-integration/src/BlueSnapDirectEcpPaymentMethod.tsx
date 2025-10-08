import { createBlueSnapDirectAPMPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bluesnap-direct';
import React, { type FunctionComponent, useCallback, useEffect, useState } from 'react';

import {
    AccountInstrumentFieldset,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { CheckboxFormField, Fieldset, Legend, LoadingOverlay } from '@bigcommerce/checkout/ui';

import { BluesnapECPAccountType } from './constants';
import BlueSnapDirectEcpFieldset from './fields/BlueSnapDirectEcpFieldset';
import useEcpInstruments from './hooks/useEcpInstruments';
import getEcpValidationSchema from './validation-schemas/getEcpValidationSchema';

const BlueSnapDirectEcpPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService: { initializePayment, deinitializePayment, loadInstruments },
    checkoutState: {
        data: { isPaymentDataRequired, getCustomer, getBillingAddress },
        statuses: { isLoadingInstruments },
    },
    paymentForm: { disableSubmit, setValidationSchema, setFieldValue, getFormValues },
    language,
    onUnhandledError,
}) => {
    const [disabled, setDisabled] = useState(true);
    const onChange = useCallback(
        (shopperPermission: boolean) => setDisabled(!shopperPermission),
        [setDisabled],
    );

    useEffect(
        () => disableSubmit(method, isPaymentDataRequired() && disabled),
        [disableSubmit, disabled, isPaymentDataRequired, method],
    );

    const initializeEcp = useCallback(async () => {
        await initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
            integrations: [createBlueSnapDirectAPMPaymentStrategy],
        });
    }, [initializePayment, method]);

    const deinitializeEcp = useCallback(async () => {
        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [deinitializePayment, method.gateway, method.id]);

    useEffect(() => {
        void initializeEcp();

        return () => {
            void deinitializeEcp();
        };
    }, [deinitializeEcp, initializeEcp]);

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

        const { isGuest } = getCustomer() || {};

        const shouldLoadInstruments = !isGuest && method.config.isVaultingEnabled;

        if (shouldLoadInstruments) {
            void loadInstrumentsOrThrow();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const {
        accountInstruments,
        currentInstrument,
        handleSelectInstrument,
        handleUseNewInstrument,
        isInstrumentFeatureAvailable,
        shouldShowInstrumentFieldset,
        shouldCreateNewInstrument,
    } = useEcpInstruments(method);

    const isLoading = isLoadingInstruments();

    const shouldShowForm = !shouldShowInstrumentFieldset || shouldCreateNewInstrument;
    const accountType = getFormValues().accountType;
    const shouldRenderCompanyName =
        accountType === BluesnapECPAccountType.CorporateChecking ||
        accountType === BluesnapECPAccountType.CorporateSavings;

    useEffect(() => {
        if (shouldRenderCompanyName) {
            setFieldValue('companyName', getBillingAddress()?.company);
        } else {
            setFieldValue('companyName', undefined);
        }
    }, [shouldRenderCompanyName, setFieldValue, getBillingAddress]);

    useEffect(() => {
        setValidationSchema(
            method,
            getEcpValidationSchema(language, shouldShowForm, shouldRenderCompanyName),
        );
    }, [language, shouldShowForm, shouldRenderCompanyName, setValidationSchema, method]);

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
            <Fieldset
                legend={
                    <Legend hidden>
                        {language.translate('payment.bluesnap_direct_electronic_check_label')}
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
                    <BlueSnapDirectEcpFieldset
                        language={language}
                        shouldRenderCompanyName={shouldRenderCompanyName}
                    />
                )}
                <CheckboxFormField
                    labelContent={language.translate('payment.bluesnap_direct_permission')}
                    name="shopperPermission"
                    onChange={onChange}
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
    BlueSnapDirectEcpPaymentMethod,
    [{ id: 'ecp', gateway: 'bluesnapdirect' }],
);
