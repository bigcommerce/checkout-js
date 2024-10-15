import React, { useEffect,useState } from 'react';
import { Modal, ModalHeader } from '../ui/modal';
import { withCheckout } from '../checkout';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
//import CertificateSelect from './CertificateSelect';
import { fetchCertificateDetails, createCertificate, getFormData } from './services/LambdaService';
import CertificateForm from './CertificateForm';
import { Address} from '@bigcommerce/checkout-sdk';
import { CertificateDetail, CreateCertificateProps, CertificateFormValues,Customer} from './types'

const CreateCertificate: React.FC<CreateCertificateProps> = ({ customer, certIds, shippingAddress }) => {
    const [certificateDetails, setCertificateDetails] = useState<CertificateDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    useEffect(() => {
        if (certIds.length === 0) return;
        const fetchDetails = async () => {
            try {
                if (certIds.length > 0) {
                    const details = await Promise.all(certIds.map(certId => fetchCertificateDetails(certId)));
                    setCertificateDetails(details);
                } else {
                    setCertificateDetails([]);
                }
            } catch (error) {
                console.error('Error :', error);
                setError('Failed to load certificate details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [certIds, shippingAddress]);
     const onAfterOpen = () => {
        console.log('after open');
    };
    const onRequestClose = () => {
        setIsOpen(false);
    };

    const showModal = () => {
       setIsOpen(true);
    };
    const handleSubmit = async (values: CertificateFormValues) => {
        try {
            const formData = getFormData(
                values.region,
                values.exemptionReason,
                values.effectiveDate,
                values.entityUseCode,
                values.exemptionDescription,
                customer,
                shippingAddress
            );

            const result = await createCertificate(formData);
            if (result) {
                setShowSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            }
        } catch (error) {
            console.error('Error creating certificate:', error);
        }
    };
    if (customer.isGuest) {
        return (
            <p>
                Please <a href="{`/login.php`}" rel="noopener noreferrer">sign in</a> to apply tax exemption certificates to this transaction.
            </p>
        );
    }
    if (loading) {
        return <p>Checking if any certificates apply to this transaction...</p>;
    } else if (error) {
        return <p>{error}</p>;
    } else if (!certificateDetails.length) {
        return <p>No exemption certificates found.</p>;
    } else {
        return (
            <>
                <div>
                    <span>Certificate Applied:</span>
                    {certificateDetails.length > 0 ? (
                        certificateDetails.map((details, index) => {
                            const detail = Array.isArray(details) ? details[0] : details;
                            return detail ? (
                                <div key={detail.id}>
                                    <p>
                                        <span>Exempt Reason:</span> {detail?.exemptionReason?.name || 'Unknown'}
                                        <br />
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
                <a onClick={() => showModal()} > Add Tax Exempt Certificate  </a>
                <Modal
                    additionalModalClassName="modal--big"
                    header={
                        <ModalHeader>
                            Add New Certificate
                        </ModalHeader>
                    }
                    isOpen={isOpen}
                    onAfterOpen={onAfterOpen}
                    onRequestClose={onRequestClose}
                    shouldShowCloseButton={true}
                >
                    <CertificateForm  onSubmit={handleSubmit} />
                    {showSuccess && (
                        <div className="success-message">
                            Certificate Created Sucessfully!
                        </div>
                    )}
                </Modal>
            </>
        );
    }
};


interface WithCheckoutCustomerInfoProps {
    email: string;
    customer: Customer;
    shippingAddress: Address;
}

function mapToWithCheckoutCustomerInfoProps({
  checkoutState,
}: CheckoutContextProps): WithCheckoutCustomerInfoProps | null {
    const {
        data: { getBillingAddress, getCheckout, getCustomer, getShippingAddress },
    } = checkoutState;

    const billingAddress = getBillingAddress();
    const checkout = getCheckout();
    const customer = getCustomer();
    const shippingAddress = getShippingAddress();

    if (!billingAddress || !checkout || !customer || !shippingAddress) {
        return null;
    }
  if (!billingAddress || !checkout || !customer) {
    return null;
  }

    return {
        email: billingAddress.email || customer.email,
        customer,
        shippingAddress,
    };
}

export default withCheckout(mapToWithCheckoutCustomerInfoProps)(CreateCertificate);