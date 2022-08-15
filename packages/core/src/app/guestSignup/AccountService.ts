import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { CreatedCustomer, CreatedCustomerResponse } from './CreatedCustomer';

export interface CustomerCreateRequestBody {
    confirmPassword: string;
    newsletter: boolean;
    orderId: number;
    password: string;
}

export default class AccountService {
    constructor(private requestSender: RequestSender = createRequestSender()) {}

    create(body: CustomerCreateRequestBody): Promise<CreatedCustomer> {
        return this.requestSender
            .put<CreatedCustomerResponse>('/internalapi/v1/checkout/customer', { body })
            .then((response) => response.body.data.customer);
    }
}
