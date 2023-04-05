export const recurlyId = window.RECURLY_PUBLIC_KEY ?? process.env.RECURLY_PUBLIC_KEY;

// @ts-ignore
export const apiEndpoint = window.FRONTEND_API_ENDPOINT ?? process.env.FRONTEND_API_ENDPOINT;
// @ts-ignore
export const recurlyBcAppId = window.RECURLY_BC_APP_ID ?? process.env.RECURLY_BC_APP_ID;
export default {recurlyId, apiEndpoint, recurlyBcAppId};
