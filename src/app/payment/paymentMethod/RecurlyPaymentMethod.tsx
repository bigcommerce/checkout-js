import { CardInstrument,
    Checkout,
    Customer, Order,
    PaymentInitializeOptions, PaymentMethod, StoreConfig,
    StripeElementOptions } from '@bigcommerce/checkout-sdk';
import { ScriptLoader } from '@bigcommerce/script-loader';
import React, { useCallback, useEffect, useRef, useState, FunctionComponent } from 'react';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import { TranslatedString } from '../../locale';
import { submitOrder } from '../../recurly/submitOrder';
import { withHostedCreditCardFieldset, WithInjectedHostedCreditCardFieldsetProps } from '../hostedCreditCard';
import withPayment, { WithPaymentProps } from '../withPayment';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type StripePaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

interface WithCheckoutStripePaymentMethodProps {
    storeUrl: string;
    checkout: Checkout;
    customer: Customer;
    config: StoreConfig;
    order: Order;
    method: PaymentMethod;
}

const RecurlyPaymentMethod: FunctionComponent<StripePaymentMethodProps & WithCheckoutStripePaymentMethodProps & WithPaymentProps> = ({
                                                                                                                                         method,
                                                                                                                                         storeUrl,
                                                                                                                                         setSubmit,
                                                                                                                                         customer,
                                                                                                                                         checkout,
                                                                                                                                         order,
                                                                                                                                         config,
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
        } = checkout.billingAddress || {};
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
            recurly.token(recurlyElements, customerInformation, (err, token) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(token);
                    submitOrder({
                        token,
                        currency: checkout.cart.currency.code,
                        cartId: checkout.cart.id,
                        store: config.storeProfile.storeHash,
                        orderId: order?.orderId,
                    }).then(json => {
                        window.location.replace(`checkout/order-confirmation/${json.orderId}`);

                    });
                }
            });
        }

    }, [checkout.billingAddress, checkout.cart.currency.code, checkout.cart.id, config.storeProfile.storeHash, firstName, lastName, order, recurlyElements]);
    useEffect(() => {
        setSubmit(method, onSubmit);
        console.log(method, onSubmit);
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
    {checkoutState}: CheckoutContextProps) {
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

// @ts-ignore
export default withPayment(withCheckout(mapFromCheckoutProps)(RecurlyPaymentMethod));
