// NOTE: This is a legacy regex used to create accounts, more flexible than the current used one
// we need to keep this regex for login validation as accounts might have been created using this regex
export const EMAIL_REGEXP =
    /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
