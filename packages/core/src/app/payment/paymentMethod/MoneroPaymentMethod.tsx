import React, { useEffect, useState } from 'react'
import './MoneroPaymentMethod.scss';
import { LoadingSpinner } from '@bigcommerce/checkout/ui';
import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import QRCode from 'react-qr-code';

interface CreatePaymentRequest {
    checkoutId: string;
    amount: number;
    currency: string;
    email: string;
}

interface CreatePaymentResponse {
    paymentId: string;
    xmrAmount: number;
    address: string;
    walletURI: string;
    qrLink: string;
}

export function MoneroPaymentMethod(props: any) {
    const [loading, setLoading] = useState(false);
    const [paymentResponse, setPaymentResponse] = useState<CreatePaymentResponse | null>(null);
    const [paymentLink, setPaymentLink] = useState("");

    console.log(props)

    useEffect(() => {
        // Try to fetch existing payment by checkoutId
    }, [])

    const createPaymentAddress = async () => {
        setLoading(true);

        try {
            const service = createCheckoutService();
            // const state = await service.loadCheckout(checkoutId);

            const checkoutSelectors = await service.loadCheckout(service.getState().data.getCheckout()?.id)

            const checkout = checkoutSelectors.data.getCheckout();

            if (!checkout) return;
            
            console.log(checkout?.grandTotal)
            console.log(checkout?.id)
            console.log(checkout?.cart.currency.code)
            console.log(checkout?.customer.email)

            const createPaymentRequest: CreatePaymentRequest = {
                amount: checkout.grandTotal,
                checkoutId: checkout.id,
                email: checkout.customer.email,
                currency: checkout.cart.currency.code
            }

            const response = await fetch("http://localhost:5025/api" + "/payments", {
                method: "POST",
                body: JSON.stringify(createPaymentRequest),
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                }
            });
    
            if (!response.ok) {
                // setError(await response.json());
                return;
            }

            const createPaymentResponse: CreatePaymentResponse = await response.json();
            console.log(createPaymentResponse)

            setPaymentResponse(createPaymentResponse);
            setPaymentLink(`monero:${createPaymentResponse.address}?tx_amount=${createPaymentResponse.xmrAmount ?? 0}`);
        }
        catch {

        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className='main'>
            <button type='button' onClick={createPaymentAddress} className='button'>Create a one-time payment address</button>
            <LoadingSpinner isLoading={loading}></LoadingSpinner>
            {
                paymentResponse && 
                <div>
                    <label htmlFor='address'>Address</label>
                    <textarea readOnly rows={2} name='address' id='address' className='form-input optimizedCheckout-form-input address' value={paymentResponse.address}/>
                    <label htmlFor='amount'>Amount</label>
                    <input readOnly name='amount' id='amount' className='form-input optimizedCheckout-form-input amount' value={paymentResponse.xmrAmount}/>
                    
                    <QRCode className="QR" value={paymentLink}></QRCode>
                </div>
            }
        </div>
    );

}