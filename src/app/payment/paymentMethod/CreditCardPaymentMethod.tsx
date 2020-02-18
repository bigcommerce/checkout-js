import { CardInstrument, CheckoutSelectors, HostedFieldBlurEventData, HostedFieldCardTypeChangeEventData, HostedFieldFocusEventData, HostedFieldType, HostedFieldValidateEventData, HostedFormOptions, Instrument, PaymentInitializeOptions, PaymentInstrument, PaymentMethod, PaymentRequestOptions } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { find, forIn, noop, some } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { ObjectSchema } from 'yup';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import { connectFormik, ConnectFormikProps } from '../../common/form';
import { MapToProps } from '../../common/hoc';
import { withLanguage, WithLanguageProps } from '../../locale';
import { LoadingOverlay } from '../../ui/loading';
import { configureCardValidator, getCreditCardInputStyles, getCreditCardValidationSchema, getHostedCreditCardValidationSchema, CreditCardCustomerCodeField, CreditCardFieldset, CreditCardFieldsetValues, CreditCardInputStylesType, HostedCreditCardFieldset, HostedCreditCardFieldsetValues } from '../creditCard';
import { getHostedInstrumentValidationSchema, getInstrumentValidationSchema, isCardInstrument, isInstrumentCardCodeRequiredSelector, isInstrumentCardNumberRequiredSelector, isInstrumentFeatureAvailable, CardInstrumentFieldset, CardInstrumentFieldsetValues, CreditCardValidation, HostedCreditCardValidation } from '../storedInstrument';
import withPayment, { WithPaymentProps } from '../withPayment';
import { PaymentFormValues } from '../PaymentForm';

export interface CreditCardPaymentMethodProps {
    isInitializing?: boolean;
    isUsingMultiShipping?: boolean;
    method: PaymentMethod;
    shouldDisableHostedFieldset?: boolean;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
}

export type CreditCardPaymentMethodValues = CreditCardFieldsetValues | CardInstrumentFieldsetValues | HostedCreditCardFieldsetValues;

interface WithCheckoutCreditCardPaymentMethodProps {
    instruments: CardInstrument[];
    isCardCodeRequired: boolean;
    isCustomerCodeRequired: boolean;
    isInstrumentFeatureAvailable: boolean;
    isLoadingInstruments: boolean;
    isPaymentDataRequired: boolean;
    shouldUseHostedFieldset: boolean;
    shouldShowInstrumentFieldset: boolean;
    isInstrumentCardCodeRequired(instrument: Instrument, method: PaymentMethod): boolean;
    isInstrumentCardNumberRequired(instrument: Instrument): boolean;
    loadInstruments(): Promise<CheckoutSelectors>;
}

interface CreditCardPaymentMethodState {
    focusedHostedFieldType?: HostedFieldType;
    isAddingNewCard: boolean;
    selectedInstrumentId?: string;
}

class CreditCardPaymentMethod extends Component<
    CreditCardPaymentMethodProps &
        WithCheckoutCreditCardPaymentMethodProps &
        WithPaymentProps &
        WithLanguageProps &
        ConnectFormikProps<PaymentFormValues>,
    CreditCardPaymentMethodState
> {
    state: CreditCardPaymentMethodState = {
        isAddingNewCard: false,
    };

    async componentDidMount(): Promise<void> {
        const {
            initializePayment,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            loadInstruments,
            method,
            onUnhandledError = noop,
            setValidationSchema,
            shouldUseHostedFieldset,
        } = this.props;

        setValidationSchema(method, this.getValidationSchema());
        configureCardValidator();

        try {
            if (isInstrumentFeatureAvailableProp) {
                await loadInstruments();
            }

            await initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
                creditCard: shouldUseHostedFieldset ?
                    { form: await this.getHostedFormOptions() } :
                    undefined,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    async componentWillUnmount(): Promise<void> {
        const {
            deinitializePayment,
            method,
            onUnhandledError = noop,
            setValidationSchema,
        } = this.props;

        setValidationSchema(method, null);

        try {
            await deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    async componentDidUpdate(_prevProps: Readonly<CreditCardPaymentMethodProps>, prevState: Readonly<CreditCardPaymentMethodState>): Promise<void> {
        const {
            deinitializePayment,
            initializePayment,
            method,
            onUnhandledError = noop,
            setValidationSchema,
            shouldUseHostedFieldset,
        } = this.props;

        const {
            isAddingNewCard,
            selectedInstrumentId,
        } = this.state;

        setValidationSchema(method, this.getValidationSchema());

        if (shouldUseHostedFieldset &&
            selectedInstrumentId !== prevState.selectedInstrumentId ||
            isAddingNewCard !== prevState.isAddingNewCard) {
            try {
                await deinitializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                });

                await initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                    creditCard: { form: await this.getHostedFormOptions() },
                });
            } catch (error) {
                onUnhandledError(error);
            }
        }
    }

    render(): ReactNode {
        const {
            instruments,
            isCardCodeRequired,
            isCustomerCodeRequired,
            isInitializing,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isLoadingInstruments,
            shouldShowInstrumentFieldset,
            shouldUseHostedFieldset,
            method,
        } = this.props;

        const {
            focusedHostedFieldType,
            isAddingNewCard,
            selectedInstrumentId = this.getDefaultInstrumentId(),
        } = this.state;

        const selectedInstrument = find(instruments, { bigpayToken: selectedInstrumentId });
        const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCard;
        const isLoading = isInitializing || isLoadingInstruments;
        const shouldShowNumberField = selectedInstrument ? isInstrumentCardNumberRequiredProp(selectedInstrument) : false;
        const shouldShowCardCodeField = selectedInstrument ? isInstrumentCardCodeRequiredProp(selectedInstrument, method) : false;

        return (
            <LoadingOverlay
                hideContentWhenLoading
                isLoading={ isLoading }
            >
                <div className="paymentMethod paymentMethod--creditCard">
                    { shouldShowInstrumentFieldset && <CardInstrumentFieldset
                        instruments={ instruments }
                        onSelectInstrument={ this.handleSelectInstrument }
                        onUseNewInstrument={ this.handleUseNewCard }
                        selectedInstrumentId={ selectedInstrumentId }
                        validateInstrument={ shouldUseHostedFieldset ?
                            <HostedCreditCardValidation
                                cardCodeId={ shouldShowCardCodeField ? 'ccCvv' : undefined }
                                cardNumberId={ shouldShowNumberField ? 'ccNumber' : undefined }
                                focusedFieldType={ focusedHostedFieldType }
                            /> :
                            <CreditCardValidation
                                shouldShowCardCodeField={ shouldShowCardCodeField }
                                shouldShowNumberField={ shouldShowNumberField }
                            /> }
                    /> }

                    { shouldShowCreditCardFieldset && !shouldUseHostedFieldset && <CreditCardFieldset
                        shouldShowCardCodeField={ method.config.cardCode || method.config.cardCode === null }
                        shouldShowCustomerCodeField={ method.config.requireCustomerCode }
                        shouldShowSaveCardField={ isInstrumentFeatureAvailableProp }
                    /> }

                    { shouldShowCreditCardFieldset && shouldUseHostedFieldset && <HostedCreditCardFieldset
                        additionalFields={ isCustomerCodeRequired && <CreditCardCustomerCodeField name="ccCustomerCode" /> }
                        cardCodeId={ isCardCodeRequired ? 'ccCvv' : undefined }
                        cardExpiryId="ccExpiry"
                        cardNameId="ccName"
                        cardNumberId="ccNumber"
                        focusedFieldType={ focusedHostedFieldType }
                        shouldShowSaveCardField={ isInstrumentFeatureAvailableProp }
                    /> }
                </div>
            </LoadingOverlay>
        );
    }

    private getDefaultInstrumentId(): string | undefined {
        const { isAddingNewCard } = this.state;

        if (isAddingNewCard) {
            return;
        }

        const { instruments } = this.props;
        const defaultInstrument = (
            instruments.find(instrument => instrument.defaultInstrument) ||
            instruments[0]
        );

        return defaultInstrument && defaultInstrument.bigpayToken;
    }

    private getValidationSchema(): ObjectSchema<CreditCardPaymentMethodValues> | null {
        const {
            instruments,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isPaymentDataRequired,
            language,
            method,
            shouldUseHostedFieldset,
        } = this.props;

        if (!isPaymentDataRequired) {
            return null;
        }

        const { selectedInstrumentId = this.getDefaultInstrumentId() } = this.state;
        const selectedInstrument = find(instruments, { bigpayToken: selectedInstrumentId });

        if (isInstrumentFeatureAvailableProp && selectedInstrument) {
            if (!shouldUseHostedFieldset) {
                return getInstrumentValidationSchema({
                    instrumentBrand: selectedInstrument.brand,
                    instrumentLast4: selectedInstrument.last4,
                    isCardCodeRequired: isInstrumentCardCodeRequiredProp(selectedInstrument, method),
                    isCardNumberRequired: isInstrumentCardNumberRequiredProp(selectedInstrument),
                    language,
                });
            }

            return getHostedInstrumentValidationSchema({ language });
        }

        if (!shouldUseHostedFieldset) {
            return getCreditCardValidationSchema({
                isCardCodeRequired: method.config.cardCode === true,
                language,
            });
        }

        return getHostedCreditCardValidationSchema({ language });
    }

    private async getHostedFormOptions(): Promise<HostedFormOptions> {
        const {
            instruments,
            isCardCodeRequired,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
            shouldShowInstrumentFieldset,
        } = this.props;

        const {
            selectedInstrumentId = this.getDefaultInstrumentId(),
        } = this.state;

        const selectedInstrument = find(instruments, { bigpayToken: selectedInstrumentId });
        const shouldShowNumberVerificationField = selectedInstrument ? isInstrumentCardNumberRequiredProp(selectedInstrument) : false;
        const styleProps = ['color', 'fontFamily', 'fontSize', 'fontWeight'];
        const styleContainerId = shouldShowInstrumentFieldset && selectedInstrumentId ?
            (isInstrumentCardCodeRequiredProp ? 'ccCvv' : 'ccNumber') :
            'ccNumber';

        return {
            fields: shouldShowInstrumentFieldset && selectedInstrumentId ?
                {
                    cardCodeVerification: isInstrumentCardCodeRequiredProp ? { containerId: 'ccCvv', instrumentId: selectedInstrumentId } : undefined,
                    cardNumberVerification: shouldShowNumberVerificationField ? { containerId: 'ccNumber', instrumentId: selectedInstrumentId } : undefined,
                } :
                {
                    cardCode: isCardCodeRequired ? { containerId: 'ccCvv' } : undefined,
                    cardExpiry: { containerId: 'ccExpiry' },
                    cardName: { containerId: 'ccName' },
                    cardNumber: { containerId: 'ccNumber' },
                },
            styles: {
                default: await getCreditCardInputStyles(styleContainerId, styleProps),
                error: await getCreditCardInputStyles(styleContainerId, styleProps, CreditCardInputStylesType.Error),
                focus: await getCreditCardInputStyles(styleContainerId, styleProps, CreditCardInputStylesType.Focus),
            },
            onBlur: this.handleHostedFieldBlur,
            onCardTypeChange: this.handleHostedFieldCardTypeChange,
            onFocus: this.handleHostedFieldFocus,
            onValidate: this.handleHostedFieldValidate,
        };
    }

    private handleUseNewCard: () => void = () => {
        this.setState({
            isAddingNewCard: true,
            selectedInstrumentId: undefined,
        });
    };

    private handleSelectInstrument: (id: string) => void = id => {
        this.setState({
            isAddingNewCard: false,
            selectedInstrumentId: id,
        });
    };

    private handleHostedFieldBlur: (event: HostedFieldBlurEventData) => void = ({ fieldType }) => {
        const { focusedHostedFieldType } = this.state;

        if (focusedHostedFieldType === fieldType) {
            this.setState({
                focusedHostedFieldType: undefined,
            });
        }
    };

    private handleHostedFieldFocus: (event: HostedFieldFocusEventData) => void = ({ fieldType }) => {
        this.setState({
            focusedHostedFieldType: fieldType,
        });
    };

    private handleHostedFieldValidate: (data: HostedFieldValidateEventData) => void = ({ errors }) => {
        const { formik: { setFieldValue } } = this.props;

        forIn(errors, (fieldErrors = [], fieldType) => {
            setFieldValue(
                `hostedForm.errors.${fieldType}`,
                fieldErrors[0] ? fieldErrors[0].type : ''
            );
        });
    };

    private handleHostedFieldCardTypeChange: (data: HostedFieldCardTypeChangeEventData) => void = ({ cardType }) => {
        const { formik: { setFieldValue } } = this.props;

        setFieldValue('hostedForm.cardType', cardType);
    };
}

function mapFromCheckoutProps(): MapToProps<
    CheckoutContextProps,
    WithCheckoutCreditCardPaymentMethodProps,
    CreditCardPaymentMethodProps & ConnectFormikProps<PaymentFormValues>
> {
    const filterInstruments = memoizeOne((instruments: PaymentInstrument[] = []) => instruments.filter(isCardInstrument));

    return (context, props) => {
        const {
            formik: { values },
            isUsingMultiShipping = false,
            method,
            shouldDisableHostedFieldset,
        } = props;

        const { checkoutService, checkoutState } = context;

        const {
            data: {
                getConfig,
                getCustomer,
                getInstruments,
                isPaymentDataRequired,
            },
            statuses: {
                isLoadingInstruments,
            },
        } = checkoutState;

        const config = getConfig();
        const customer = getCustomer();

        if (!config || !customer || !method) {
            return null;
        }

        const instruments = filterInstruments(getInstruments(method));
        const isInstrumentFeatureAvailableProp = isInstrumentFeatureAvailable({
            config,
            customer,
            isUsingMultiShipping,
            paymentMethod: method,
        });

        return {
            instruments,
            isCardCodeRequired: method.config.cardCode || method.config.cardCode === null,
            isCustomerCodeRequired: !!method.config.requireCustomerCode,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredSelector(checkoutState),
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredSelector(checkoutState),
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isLoadingInstruments: isLoadingInstruments(),
            isPaymentDataRequired: isPaymentDataRequired(values.useStoreCredit),
            loadInstruments: checkoutService.loadInstruments,
            shouldShowInstrumentFieldset: isInstrumentFeatureAvailableProp && instruments.length > 0,
            shouldUseHostedFieldset: (
                shouldDisableHostedFieldset !== true &&
                config.checkoutSettings.isHostedPaymentFormEnabled &&
                some(config.paymentSettings.clientSidePaymentProviders, id =>
                    method.id === id || method.gateway === id
                )
            ),
        };
    };
}

export default connectFormik(withLanguage(withPayment(withCheckout(mapFromCheckoutProps)(CreditCardPaymentMethod))));
