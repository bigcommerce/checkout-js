import { createCheckoutService } from '@bigcommerce/checkout-sdk/essential';
import { render, type RenderOptions } from '@testing-library/react';
import React, { type ReactElement } from 'react';

import { ThemeProvider } from '@bigcommerce/checkout/contexts';
import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
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

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
    render(ui, { ...options, wrapper: AllTheProviders, legacyRoot: true });
const customRenderWithoutWrapper = (ui: ReactElement, options?: RenderOptions) =>
    render(ui, { ...options, legacyRoot: true });

// eslint-disable-next-line import/export
export * from '@testing-library/react';

// eslint-disable-next-line import/export
export { customRender as render };
export { customRenderWithoutWrapper as renderWithoutWrapper };
