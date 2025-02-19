import React, {useState } from 'react';
import { Modal, ModalHeader } from '../ui/modal';
import { withCheckout } from '../checkout';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
//import CertificateSelect from './CertificateSelect';
import {  createCertificate, getFormData } from './services/LambdaService';
import CertificateForm from './CertificateForm';
import { Address} from '@bigcommerce/checkout-sdk';
import {  CreateCertificateProps, CertificateFormValues,Customer} from './types'


const CreateCertificate: React.FC<CreateCertificateProps & { checkoutService: any }> = ({ customer, shippingAddress, checkoutService}) => {
    //const [certificateDetails, setCertificateDetails] = useState<CertificateDetail[]>([]);
    //const [loading, setLoading] = useState(true);
    //const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
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
                setTimeout(async () => {
                    try {
                        const response = await checkoutService.loadCheckout();
                        let shippingAddress = response.data.getShippingAddress();
                        if (shippingAddress) {
                            await checkoutService.updateShippingAddress(shippingAddress);
                        }
                        try {
                            const checkoutData = await checkoutService.loadCheckout();
                            const updateData = {
                                cart: checkoutData.data.getCart(),
                                shippingAddress: checkoutData.data.getShippingAddress(),
                                billingAddress: checkoutData.data.getBillingAddress(),
                                customer: checkoutData.data.getCustomer(),
                                customerMessage: "",
                            };

                            await checkoutService.updateCheckout(updateData);
                        } catch (error) {
                            console.error("Error en updateCheckout:", error);
                        }

                        setShowSuccess(false);
                        setIsOpen(false);
                        //window.location.reload();
                    } catch (error) {
                        console.error('Error reloading checkout:', error);
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('Error creating certificate:', error);
        }
    };
    if (customer.isGuest) {
        return (
            <p>
                Please <a href="/login.php?from=checkout" rel="noopener noreferrer">sign in</a> to apply tax exemption certificates to this transaction.
            </p>
        );
    }
    else {
        return (
            <>
                {/* <div>
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
                </div> */}
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
    checkoutService,
}: CheckoutContextProps): WithCheckoutCustomerInfoProps & { checkoutService: any } | null {

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

    return {
        email: billingAddress.email || customer.email,
        customer,
        shippingAddress,
        checkoutService, 
    };
}

export default withCheckout(mapToWithCheckoutCustomerInfoProps)(CreateCertificate);
