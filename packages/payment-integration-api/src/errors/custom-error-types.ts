export default interface SpecificError extends Error {
    errors?: ErrorElement[];
    status?: string;
}

interface ErrorElement {
    code: string;
    message: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    provider_error?: {
        code: string;
    };
}
