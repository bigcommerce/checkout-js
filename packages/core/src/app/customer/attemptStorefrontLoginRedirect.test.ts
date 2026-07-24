import { getStoreConfig } from '../config/config.mock';

import attemptStorefrontLoginRedirect from './attemptStorefrontLoginRedirect';

describe('attemptStorefrontLoginRedirect()', () => {
    const { assign } = window.location;

    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: { assign: jest.fn() },
            writable: true,
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            value: { assign },
            writable: true,
        });
    });

    it('returns false and does not redirect if config is not provided', () => {
        expect(attemptStorefrontLoginRedirect(undefined)).toBe(false);
        expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('returns false and does not redirect if shouldRedirectToStorefrontForAuth is false', () => {
        const config = getStoreConfig();

        config.checkoutSettings.shouldRedirectToStorefrontForAuth = false;

        expect(attemptStorefrontLoginRedirect(config)).toBe(false);
        expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('returns true and redirects to the login link when shouldRedirectToStorefrontForAuth is true', () => {
        const config = getStoreConfig();

        config.checkoutSettings.shouldRedirectToStorefrontForAuth = true;

        expect(attemptStorefrontLoginRedirect(config)).toBe(true);
        expect(window.location.assign).toHaveBeenCalledWith(
            `${config.links.loginLink}?redirectTo=${config.links.checkoutLink}`,
        );
    });
});
