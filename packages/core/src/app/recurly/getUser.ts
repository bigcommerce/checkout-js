import { apiEndpoint } from './config';

export default async function getUser(store: string) {
    const customerResponse = await fetch('/customer/current.jwt?app_client_id=q4qtaqh5lhic2zcqu6n1kcs7ep1fbz8');
    const jwtToken = await customerResponse.text();
    const response = await fetch(`${apiEndpoint}/api/recurly/account?token=${jwtToken}&store=${store}`, {
        method: 'GET',
    });

    return await response.json();
}
