import axios from 'axios';
import { Address } from '@bigcommerce/checkout-sdk';
const API_URL = 'https://61oz9fx2d9.execute-api.us-east-2.amazonaws.com/Prod/';

export const fetchToken = async (): Promise<string | null> => {
    try {
        const response = await fetch('/customer/current.jwt?app_client_id=npqb1dowfj7yeh7d1fqwhcod7wqs6al', {
            method: 'GET',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Error fetching token:', error);
        return null;
    }
};
export const getHeaders = (token: string) => {
    return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Current-Customer': token,
    };
};

export const fetchCertificateDetails = async (certId: number) => {
    try {
        const token = await fetchToken();
        if (!token) {
            throw new Error('Token not available');
        }

        const headers = getHeaders(token);
        const response = await axios.get(`${API_URL}query/${certId}`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching certificate details:', error);
        throw error;
    }
};
export const validateTaxesWithAvalara = async (taxRequest: any) => {
    try {
        const token = await fetchToken();
        if (!token) {
            throw new Error('Token not available');
        }
        const headers = getHeaders(token);
        const response = await axios.post(`${API_URL}createTransaction`, taxRequest, { headers });
        return response.data;
    } catch (error) {
        console.error('Error validating with avalara:', error);
        throw error;
    }
};
export const createCertificate = async (formData: any) => {
    try {
        const token = await fetchToken();
        if (!token) {
            throw new Error('Token not available');
        }
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Current-Customer': token,
        };
        const response = await axios.post(`${API_URL}create`, formData, { headers });

        if (response.status !== 200) {
            throw new Error(`Error submitting the form: ${response.statusText}`);
        }
        return response.data;
    } catch (error) {
        console.error('Error creating certificate:', error);
        throw error;
    }
};

export const getFormData = (
    region: string,
    exemptionReason: string,
    effectiveDate: string,
    entityUseCode: string,
    exemptionDescription: string,
    customer: {
        id: number;
        fullName: string;
        email: string;
        isGuest: boolean;
    },
    shippingAddress: Address
) => {
    const formData  = {
        signedDate: effectiveDate,
        expirationDate: '9999-12-31',
        exposureZone: { name: region },
        exemptionReason: { name: exemptionReason },
        valid: true,
        CertificateCustomFields: {
            1: entityUseCode,
            2: exemptionDescription,
        },
        customers: [
            {
                customerCode: customer.id,
                name: customer.fullName,
                line1: shippingAddress.address1,
                line2: shippingAddress.address2,
                city: shippingAddress.city,
                postalCode: shippingAddress.postalCode,
                phoneNumber: shippingAddress.phone,
                emailAddress: customer.email,
                country: shippingAddress.countryCode,
                region: shippingAddress.stateOrProvinceCode ,
            },
        ],
    };

    return formData;
};
