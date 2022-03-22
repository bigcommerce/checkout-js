import { Checkout,
    Customer, Order,
    PaymentInitializeOptions, PaymentMethod, StoreConfig,
    StripeElementOptions } from '@bigcommerce/checkout-sdk';
import { ScriptLoader } from '@bigcommerce/script-loader';
import { CardElement, CustomerData, Elements } from '@recurly/recurly-js';
import React, { useCallback, useEffect, useRef, useState, FunctionComponent } from 'react';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import { ErrorModal } from '../../common/error';
import { recurlyId } from '../../recurly/config';
import withRecurly from '../../recurly/withRecurly';
import { RecurlyContextProps } from '../../recurly/RecurlyContext';
import withPayment, { WithPaymentProps } from '../withPayment';

interface WithCheckoutRecurlyCheckoutProps {
    storeUrl: string;
    checkout?: Checkout;
    customer?: Customer;
    config: StoreConfig;
    order?: Order;

}

interface RecurlyProps {
    method: PaymentMethod;
}

interface WithRecurlyProps {
    submitRecurlyOrder(elements: Elements, customerInformation: CustomerData, secureToken?: any): Promise<any>;
    resubmitRecurlyOrder(customerInformation: CustomerData, secureToken: any): Promise<any>;
}
interface ThreeDSecureToken {
    id: string;
    token: string;
}

interface ElementState {
    valid: boolean;
    firstSix: string;
    lastFour: string;
    brand: string;
    empty: boolean;
    focus: boolean;
    number: {empty: boolean; focus: boolean; valid: boolean};
    expiry: {empty: boolean; focus: boolean; valid: boolean};
    cvv: {empty: boolean; focus: boolean; valid: boolean};
}

const RecurlyPaymentMethod: FunctionComponent<WithCheckoutRecurlyCheckoutProps & WithPaymentProps & WithRecurlyProps & RecurlyProps> = ({
                                                                                                                                         method,
                                                                                                                                         storeUrl,
                                                                                                                                         setSubmit,
                                                                                                                                         customer,
                                                                                                                                         checkout,
                                                                                                                                         order,
                                                                                                                                         config,
    submitRecurlyOrder,
    disableSubmit, setValidationSchema, hidePaymentSubmitButton, resubmitRecurlyOrder,
                                                                                                                                         ...rest
                                                                                                                                     }) => {
    // console.log(order);
    // console.log(customer);
    // console.log(checkout);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [recurlyElements, setRecurlyElements] = useState<any>(null);
    const [recurly3dSecure, setRecurly3dSecure] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [recurlyValidationState, setRecurlyValidationState] = useState<ElementState>({
        brand: '',
        cvv: {empty: true, focus: false, valid: false},
        empty: false,
        expiry: {empty: true, focus: false, valid: false},
        firstSix: '',
        focus: false,
        lastFour: '',
        number: {empty: true, focus: false, valid: false},
        valid: false,
    });
    const cardRef = useRef<HTMLDivElement>(null);
    const recurly3dSecureContainerRef = useRef<HTMLDivElement>(null);
    const submitForm = useCallback((token?: ThreeDSecureToken) => {
        setHasSubmitted(true);
        const {
            address1,
            address2,
            country,
            stateOrProvince,
            postalCode,
        } = checkout?.billingAddress || {};
        if (firstName && lastName && recurlyValidationState.number.valid && recurlyValidationState.expiry.valid && recurlyValidationState.cvv.valid) {
            const customerInformation = {
                address1,
                address2,
                country,
                state: stateOrProvince,
                postal_code: postalCode,
                first_name: firstName,
                last_name: lastName,
            };
            (token ? resubmitRecurlyOrder(customerInformation, token) : submitRecurlyOrder(recurlyElements, customerInformation)).then(() => {
                // success
            }, (err: any) => {
                console.log('failure', err);
                if (err.code === 'three_d_secure_action_required') {
                    const risk = recurly.Risk();
                    const secure = risk.ThreeDSecure({actionTokenId: err.threeDSecureActionTokenId});
                    setRecurly3dSecure(secure);
                } else {
                    setError(err);
                }
            });

        }
    }, [checkout, firstName, lastName, recurlyElements, resubmitRecurlyOrder, submitRecurlyOrder, recurlyValidationState]);
    const onSubmit = useCallback(() => {
        submitForm();

    }, [submitForm]);
    useEffect(() => {
        setSubmit(method, onSubmit);
    }, [method, onSubmit, setSubmit]);

    const onSecureFailure = useCallback((err: any) => {
        setError(err);
        console.log('token failure', err);
    }, []);
    const onSecureSuccess = useCallback((token: ThreeDSecureToken) => {
        submitForm(token);
    }, [submitForm]);
    useEffect(() => {
        if (recurly3dSecure) {
            recurly3dSecure.on('error', onSecureFailure);
            recurly3dSecure.on('token', onSecureSuccess);
            recurly3dSecure.attach(recurly3dSecureContainerRef.current);

            return () => {
                recurly3dSecure.off('error', onSecureFailure);
                recurly3dSecure.off('token', onSecureSuccess);
            };
        }
    }, [recurly3dSecure, onSubmit, recurly3dSecureContainerRef, submitForm, onSecureFailure, onSecureSuccess]);

    useEffect(() => {
        let cardElement: CardElement;
        const initRecurly = () => {
            console.log(recurlyId);

            recurly.configure(recurlyId);
            const elements = recurly.Elements();
            setRecurlyElements(elements);
            cardElement = elements.CardElement({
                inputType: 'text',
                style: {
                    fontColor: 'white',
                },
            });
            cardElement.on('change', e => {
                console.log(e);
                setRecurlyValidationState(e);
            });
            cardElement.on('attach', () => {
                console.log('ready');
            });
            cardElement.attach(cardRef.current as HTMLElement);
        };
        if (window.recurly) {
            initRecurly();
        } else {
            const scriptLoader = new ScriptLoader();
            scriptLoader.loadScript('https://js.recurly.com/v4/recurly.js').then(() => {
                initRecurly();
            });
        }

        return () => {
            if (cardElement) {
                cardElement.remove();
            }
        };

    }, [cardRef]);

    const setFirstNameCb = useCallback(e => {
        setFirstName(e.target.value);
    }, [setFirstName]);

    const setLastNameCb = useCallback(e => {
        setLastName(e.target.value);
    }, [setLastName]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return <div>
        { error && <ErrorModal error={ error ? new Error(error.message) : undefined } message={ error.message } onClose={ clearError } /> }
        <div className={ 'form-field' }>
            <label className={ 'form-label optimizedCheckout-form-label' } htmlFor={ 'recurly-first-name' }>
                First name
            </label>
            <input
                className={ 'form-input optimizedCheckout-form-input' } data-recurly="first_name"
                id={ 'recurly-first-name' } onChange={ setFirstNameCb } type="text" value={ firstName }
            />
            { hasSubmitted && !firstName ? <div style={ {color: '#ff0000'} }>Please enter the first name on card</div> : null }
        </div>
        <div className={ 'form-field' }>
            <label className={ 'form-label optimizedCheckout-form-label' } htmlFor={ 'recurly-last-name' }>
                Last name
            </label>
            <input
                className={ 'form-input optimizedCheckout-form-input' } data-recurly="last_name"
                id={ 'recurly-last-name' } onChange={ setLastNameCb } type="text"
            />
            { hasSubmitted && !lastName ? <div style={ {color: '#ff0000'} }>Please enter the last name on card</div> : null }
        </div>
        <div id="recurly-elements" ref={ cardRef } style={ {height: '42px'} } />
        { hasSubmitted && !recurlyValidationState.number.valid ? <div style={ {color: '#ff0000'} }>Credit card number is invalid</div> : null }

        { hasSubmitted && !recurlyValidationState.cvv.valid ? <div style={ {color: '#ff0000'} }>CVV is invalid</div> : null }
        { hasSubmitted && !recurlyValidationState.expiry.valid ? <div style={ {color: '#ff0000'} }>Expiry date is invalid</div> : null }

        <div ref={ recurly3dSecureContainerRef } style={ {width: '100%', height: '0px', display: recurly3dSecure ? 'block' : 'none'} } />

        <input data-recurly="token" name="recurly-token" type="hidden" />
    </div>;
};

function mapFromCheckoutProps(
    {checkoutState}: CheckoutContextProps): WithCheckoutRecurlyCheckoutProps | null {
    const {
        data: {
            getConfig,
            getCheckout,
            getCustomer,
            getOrder,
        },
    } = checkoutState;
    const config = getConfig();
    const checkout = getCheckout();
    const customer = getCustomer();
    const order = getOrder();

    if (!config) {
        return null;
    }

    return {
        storeUrl: config.links.siteLink,
        config,
        order,
        checkout,
        customer,
    };
}
function mapRecurlyToProps({submitOrder, resubmitRecurlyOrder}: RecurlyContextProps): WithRecurlyProps {
    return {submitRecurlyOrder: submitOrder, resubmitRecurlyOrder};
}

export default withPayment(withCheckout(mapFromCheckoutProps)(withRecurly(mapRecurlyToProps)(RecurlyPaymentMethod)));
