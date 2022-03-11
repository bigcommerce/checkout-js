import { CardInstrument,
    Checkout,
    Customer, Order,
    PaymentInitializeOptions, PaymentMethod, StoreConfig,
    StripeElementOptions } from '@bigcommerce/checkout-sdk';
import { ScriptLoader } from '@bigcommerce/script-loader';
import { CustomerData, Elements } from '@recurly/recurly-js';
import React, { useCallback, useEffect, useRef, useState, FunctionComponent } from 'react';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import { TranslatedString } from '../../locale';
import withRecurly from '../../recurly/withRecurly';
import { RecurlyContextProps } from '../../recurly/RecurlyContext';
import { withHostedCreditCardFieldset, WithInjectedHostedCreditCardFieldsetProps } from '../hostedCreditCard';
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
    submitRecurlyOrder(elements: Elements, customerInformation: CustomerData): void;
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
    disableSubmit, setValidationSchema, hidePaymentSubmitButton,
                                                                                                                                         ...rest
                                                                                                                                     }) => {
    console.log(order);
    console.log(customer);
    console.log(checkout);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [recurlyElements, setRecurlyElements] = useState<any>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const onSubmit = useCallback(values => {
        // get token
        // get customer / billing details
        // send token, customer and billing details to api function
        // get back order details
        // redirect to order confirmation page
        const {
            address1,
            address2,
            country,
            stateOrProvince,
            postalCode,
        } = checkout?.billingAddress || {};
        if (firstName && lastName) {
            const customerInformation = {
                address1,
                address2,
                country,
                state: stateOrProvince,
                postal_code: postalCode,
                first_name: firstName,
                last_name: lastName,
            };
            submitRecurlyOrder(recurlyElements, customerInformation);

        }

    }, [checkout, firstName, lastName, recurlyElements, submitRecurlyOrder]);
    useEffect(() => {
        setSubmit(method, onSubmit);
    }, [method, onSubmit, setSubmit]);

    useEffect(() => {
        const initRecurly = () => {
            recurly.configure(process.env.RECURLY_PUBLIC_KEY as string);
            const elements = recurly.Elements();
            setRecurlyElements(elements);
            const cardElement = elements.CardElement({
                inputType: 'text',
                style: {
                    fontColor: 'white',
                },
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

    }, [cardRef]);

    const setFirstNameCb = useCallback(e => {
        setFirstName(e.target.value);
    }, [setFirstName]);

    const setLastNameCb = useCallback(e => {
        setLastName(e.target.value);
    }, [setLastName]);

    return <div>

        <div className={ 'form-field' }>
            <label className={ 'form-label optimizedCheckout-form-label' } htmlFor={ 'recurly-first-name' }>
                First name
            </label>
            <input
                className={ 'form-input optimizedCheckout-form-input' } data-recurly="first_name"
                id={ 'recurly-first-name' } onChange={ setFirstNameCb } type="text" value={ firstName }
            />
        </div>
        <div className={ 'form-field' }>
            <label className={ 'form-label optimizedCheckout-form-label' } htmlFor={ 'recurly-last-name' }>
                Last name
            </label>
            <input
                className={ 'form-input optimizedCheckout-form-input' } data-recurly="last_name"
                id={ 'recurly-last-name' } onChange={ setLastNameCb } type="text"
            />
        </div>
        <div id="recurly-elements" ref={ cardRef } />

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
            getShippingAddress,
            getBillingAddress,
        },
    } = checkoutState;
    const config = getConfig();
    const checkout = getCheckout();
    const customer = getCustomer();
    const order = getOrder();
    const shippingAddress = getShippingAddress();
    const billingAddress = getBillingAddress();
    console.log(shippingAddress, billingAddress);

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
function mapRecurlyToProps({submitOrder}: RecurlyContextProps): WithRecurlyProps {
    return {submitRecurlyOrder: submitOrder};
}

export default withPayment(withCheckout(mapFromCheckoutProps)(withRecurly(mapRecurlyToProps)(RecurlyPaymentMethod)));
