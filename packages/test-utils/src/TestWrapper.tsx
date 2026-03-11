import { type CheckoutSelectors, createCheckoutService } from '@bigcommerce/checkout-sdk/essential';
import { render, type RenderOptions } from '@testing-library/react';
import React, { type ReactElement } from 'react';

import {
    CapabilitiesProvider,
    CheckoutProvider,
    defaultCapabilities,
    LocaleContext,
    ThemeProvider,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <CheckoutProvider checkoutService={createCheckoutService()}>
            <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                <ThemeProvider>{children}</ThemeProvider>
            </LocaleContext.Provider>
        </CheckoutProvider>
    );
};

const WithCapabilitiesProvider = ({ children }: { children: React.ReactNode }) => {
    const storeConfig = getStoreConfig();
    const configWithDefaultCapabilities = {
        ...storeConfig,
        checkoutSettings: {
            ...storeConfig.checkoutSettings,
            capabilities: defaultCapabilities,
        },
    };
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const checkoutState = {
        data: {
            getConfig: () => configWithDefaultCapabilities,
        },
    } as CheckoutSelectors;

    return <CapabilitiesProvider checkoutState={checkoutState}>{children}</CapabilitiesProvider>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
    render(ui, { ...options, wrapper: AllTheProviders, legacyRoot: true });

const customRenderWithCapabilitiesOnly = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { ...options, wrapper: WithCapabilitiesProvider, legacyRoot: true });

// eslint-disable-next-line import/export
export * from '@testing-library/react';

// eslint-disable-next-line import/export
export { customRender as render };
export { customRenderWithCapabilitiesOnly as renderWithoutWrapper };
