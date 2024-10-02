import React, { useEffect,useState } from 'react';
import { withCheckout } from '../checkout';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
//import CertificateSelect from './CertificateSelect';
import { fetchCertificateDetails } from './services/LambdaService';

interface Customer {
    id: number;
    email: string;
    isGuest: boolean;
}
interface CertificateDetail {
    id: number;
    exemptPercentage: number;
    customers: { name: string }[];
    exemptionReason: { name: string };
}

interface CreateCertificateProps {
    customer: Customer;
    certIds: number[];
}
const CreateCertificate: React.FC<CreateCertificateProps> = ({ customer, certIds }) => {
    const [certificateDetails, setCertificateDetails] = useState<CertificateDetail[]>([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null); 

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                if (certIds.length > 0) {
                    const details = await Promise.all(certIds.map(certId => fetchCertificateDetails(certId)));
                    setCertificateDetails(details);
                }
                setLoading(false); 
            } catch (error) {
                console.error('Error :', error);
                setError('Failed to load certificate details');
                setLoading(false); 
            }
        };

        fetchDetails();
    }, [certIds]);
    if (loading) {
        return <p>Loading certificates...</p>;
    }
    if (error) {
        return <p>{error}</p>;
    }

    return !customer.isGuest ? (
        <>
            <a href={`/certificates`}  rel="noopener noreferrer">
                Use Tax/ Exempt Certificate
            </a> 
            <p></p>
            <div>
                <span>Certificate Applied:</span>
                {certificateDetails.length > 0 ? (
                    certificateDetails.map((details, index) => {
                        const detail = Array.isArray(details) ? details[0] : details;
                        return detail ? (
                            <div key={detail.id}>
                                <p>
                                    {/* <span>Cert ID:</span> {detail?.id} |&nbsp;
                                    <span>Exemption Percentage:</span> {detail?.exemptPercentage}% |&nbsp;
                                    <span>Exempt Reason:</span> {detail?.exemptionReason?.name || 'Unknown'} */}

                                    <span>Exempt Reason:</span> {detail?.exemptionReason?.name || 'Unknown'}&nbsp;|&nbsp;
                                    <span>State:</span> {detail?.exposureZone.region} |&nbsp;
                                    <span>Percent:</span> {detail?.exemptPercentage}%
                                </p>
                            </div>
                        ) : (
                            <p key={index}>No details available</p>
                        );
                    })
                ) : (
                    <p>No exemption certificates found.</p>
                )}
            </div>
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
