import { createRequestSender, RequestSender, Response } from '@bigcommerce/request-sender';

import AccountService, { CustomerCreateRequestBody } from './AccountService';
import { CreatedCustomer } from './CreatedCustomer';

describe('AccountService', () => {
    let service: AccountService;
    let requestSender: RequestSender;
    let response: CreatedCustomer;

    beforeEach(() => {
        requestSender = createRequestSender();
        service = new AccountService(requestSender);
    });

    describe('create', () => {
        const payload: CustomerCreateRequestBody = {
            newsletter: false,
            password: 'foo',
            confirmPassword: 'foo',
            orderId: 1,
        };

        const customer = {
            customerGroupId: 1,
            customerGroupName: '',
            customerId: 1,
            email: '',
            firstName: '',
            isGuest: false,
            lastName: '',
            name: '',
            phoneNumber: '',
            storeCredit: 0,
        };

        beforeEach(async () => {
            jest.spyOn(requestSender, 'put').mockResolvedValue({
                body: {
                    data: {
                        customer,
                    },
                },
            } as Response);
            response = await service.create(payload);
        });

        it('calls internal api', () => {
            expect(requestSender.put).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', {
                body: payload,
            });
        });

        it('returns customer', () => {
            expect(response).toEqual(customer);
        });
    });
});
