import userEvent from '@testing-library/user-event';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import AppliedRedeemable from './AppliedRedeemable';

describe('AppliedGiftCertificate', () => {
    const onRemove = jest.fn();
    const localeContext = createLocaleContext(getStoreConfig());
    const AppliedRedeembleContainer = ({ isRemoving }: { isRemoving: boolean }) => (
        <LocaleContext.Provider value={localeContext}>
            <AppliedRedeemable isRemoving={isRemoving} onRemove={onRemove()}>
                foo
            </AppliedRedeemable>
        </LocaleContext.Provider>
    );

    it('renders children and button', async () => {
        const { container } = render(<AppliedRedeembleContainer isRemoving={false} />);

        // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
        expect(container.querySelector('.is-loading')).not.toBeInTheDocument();
        expect(screen.getByText('foo')).toBeInTheDocument();
        expect(screen.getByTestId('redeemable-remove')).toBeEnabled();

        await userEvent.click(screen.getByRole('button'));

        expect(onRemove).toHaveBeenCalled();
    });

    it('disables button when isRemoving is true', () => {
        const { container } = render(<AppliedRedeembleContainer isRemoving={true} />);

        // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
        expect(container.querySelector('.is-loading')).toBeInTheDocument();
        expect(screen.getByTestId('redeemable-remove')).toBeDisabled();
    });
});
