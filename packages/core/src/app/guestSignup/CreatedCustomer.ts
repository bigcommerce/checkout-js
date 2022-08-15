export interface CreatedCustomerResponse {
    data: {
        customer: CreatedCustomer;
    };
}

export interface CreatedCustomer {
    customerGroupId: number;
    customerGroupName: string;
    customerId: number;
    email: string;
    firstName: string;
    isGuest: boolean;
    lastName: string;
    name: string;
    phoneNumber: string;
    storeCredit: number;
}
