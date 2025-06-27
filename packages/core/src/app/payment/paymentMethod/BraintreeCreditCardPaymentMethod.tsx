import { noop } from 'lodash';
import React, {
    createRef,
    FunctionComponent,
    RefObject,
    useCallback,
    useRef,
    useState,
} from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { Modal } from '../../ui/modal';
import {
    withHostedCreditCardFieldset,
    WithInjectedHostedCreditCardFieldsetProps,
} from '../hostedCreditCard';

import CreditCardPaymentMethod, { CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';

export type BraintreeCreditCardPaymentMethodProps = CreditCardPaymentMethodProps;

interface BraintreeCreditCardPaymentMethodRef {
    threeDSecureContentRef: RefObject<HTMLDivElement>;
    cancelThreeDSecureVerification?(): void;
}

const BraintreeCreditCardPaymentMethod: FunctionComponent<
    BraintreeCreditCardPaymentMethodProps & WithInjectedHostedCreditCardFieldsetProps
> = ({
    getHostedFormOptions,
    getHostedStoredCardValidationFieldset,
    hostedFieldset,
    hostedStoredCardValidationSchema,
    hostedValidationSchema,
    initializePayment,
    onUnhandledError = noop,
    ...rest
}) => {
    const [threeDSecureContent, setThreeDSecureContent] = useState<HTMLElement>();
    const ref = useRef<BraintreeCreditCardPaymentMethodRef>({
        threeDSecureContentRef: createRef(),
    });

    const initializeBraintreePayment: BraintreeCreditCardPaymentMethodProps['initializePayment'] =
        useCallback(
            async (options, selectedInstrument) => {
                return initializePayment({
                    ...options,
                    // Info: add unsupportedCardBrands to "braintree" object
                    braintree: {
                        threeDSecure: {
                            addFrame(error, content, cancel) {
                                if (error) {
                                    return onUnhandledError(error);
                                }

                                setThreeDSecureContent(content);
                                ref.current.cancelThreeDSecureVerification = cancel;
                            },
                            removeFrame() {
                                setThreeDSecureContent(undefined);
                                ref.current.cancelThreeDSecureVerification = undefined;
                            },
                        },
                        form: getHostedFormOptions && await getHostedFormOptions(selectedInstrument),
                        // Info: this is how to pass data of unsupported card brands, so that form validation will not be passed
                        // List of credit card brands that are supported by Braintree:
                        //  'visa',
                        //  'mastercard',
                        //  'american-express',
                        //  'diners-club',
                        //  'discover',
                        //  'jcb',
                        //  'union-pay',
                        //  'maestro',
                        //  'elo',
                        //  'mir',
                        //  'hiper',
                        //  'hipercard'
                        unsupportedCardBrands: ['american-express', 'visa'], // Please use card brands names from the list above
                    },
                });
            },
            [getHostedFormOptions, initializePayment, onUnhandledError],
        );

    const appendThreeDSecureContent = useCallback(() => {
        if (ref.current.threeDSecureContentRef.current && threeDSecureContent) {
            ref.current.threeDSecureContentRef.current.appendChild(threeDSecureContent);
        }
    }, [threeDSecureContent]);

    const cancelThreeDSecureModalFlow = useCallback(() => {
        setThreeDSecureContent(undefined);

        if (ref.current.cancelThreeDSecureVerification) {
            ref.current.cancelThreeDSecureVerification();
            ref.current.cancelThreeDSecureVerification = undefined;
        }
    }, []);

    return (
        <>
            <CreditCardPaymentMethod
                {...rest}
                cardFieldset={hostedFieldset}
                cardValidationSchema={hostedValidationSchema}
                getStoredCardValidationFieldset={getHostedStoredCardValidationFieldset}
                initializePayment={initializeBraintreePayment}
                onUnhandledError={onUnhandledError}
                storedCardValidationSchema={hostedStoredCardValidationSchema}
            />

            <Modal
                additionalBodyClassName="modal-body--center"
                closeButtonLabel={<TranslatedString id="common.close_action" />}
                isOpen={!!threeDSecureContent}
                onAfterOpen={appendThreeDSecureContent}
                onRequestClose={cancelThreeDSecureModalFlow}
            >
                <div ref={ref.current.threeDSecureContentRef} />
            </Modal>
        </>
    );
};

export default withHostedCreditCardFieldset(BraintreeCreditCardPaymentMethod);
