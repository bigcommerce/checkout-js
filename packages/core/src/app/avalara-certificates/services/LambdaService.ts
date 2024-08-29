import axios from 'axios';
const API_URL = 'https://yx1041xohb.execute-api.us-east-2.amazonaws.com/Prod/query';

export const fetchToken = async (): Promise<string | null> => {
    try {
        const response = await fetch('/customer/current.jwt?app_client_id=bzhkzdt0f7vrrg92o4iym8rxvd872qj', {
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

export const fetchCertificates = async () => {
    try {
        const token = await fetchToken();
        if (!token) {
            throw new Error('Token not available');
        }
        const headers = getHeaders(token);
        const response = await axios.get(API_URL, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching certificates:', error);
        return [];
    }
};
