import React, { useState } from 'react';
import { withCheckout } from '../checkout';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
import CertificateSelect from './CertificateSelect';

interface Customer {
    id: number;
    email: string;
    isGuest: boolean;
}

interface CreateCertificateProps {
    customer: Customer;
}

const CreateCertificate: React.FC<CreateCertificateProps> = ({ customer }) => {
    const [selectedCertificate, setSelectedCertificate] = useState<string>('');

    const handleSelect = (certificate: string) => {
        setSelectedCertificate(certificate);
        console.log('Selected Certificate:', certificate);
    };

    return !customer.isGuest ? (
        <>
            <a href={`/certificates`} target="_blank" rel="noopener noreferrer">
                Use Tax/ Exempt Certificate
            </a>
            <CertificateSelect onSelect={handleSelect} />
            {selectedCertificate && <p>Selected Certificate ID: {selectedCertificate}</p>}
        </>
    ) : null;
};

interface WithCheckoutCustomerInfoProps {
    email: string;
    customer: Customer;
}

function mapToWithCheckoutCustomerInfoProps({
    checkoutState,
}: CheckoutContextProps): WithCheckoutCustomerInfoProps | null {
    const {
        data: { getBillingAddress, getCheckout, getCustomer },
    } = checkoutState;

    const billingAddress = getBillingAddress();
    const checkout = getCheckout();
    const customer = getCustomer();

    if (!billingAddress || !checkout || !customer) {
        return null;
    }

    return {
        email: billingAddress.email || customer.email,
        customer,
    };
}

export default withCheckout(mapToWithCheckoutCustomerInfoProps)(CreateCertificate);
