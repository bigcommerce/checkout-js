import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
            {children}
        </LocaleContext.Provider>
    );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
    render(ui, { wrapper: AllTheProviders, ...options });

// eslint-disable-next-line import/export
export * from '@testing-library/react';

// eslint-disable-next-line import/export
export { customRender as render };
