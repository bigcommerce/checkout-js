import { RequestError } from "@bigcommerce/checkout-sdk";

export default function isRequestError(error: any): error is RequestError {
    return error.status || error.type
}
