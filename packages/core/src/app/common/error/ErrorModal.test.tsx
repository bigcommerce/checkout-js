import { type RequestError } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { CustomError } from '@bigcommerce/checkout/payment-integration-api';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import ErrorModal from './ErrorModal';

describe('ErrorModal', () => {
    let error: Error | RequestError;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        error = new Error();
        localeContext = createLocaleContext(getStoreConfig());

    });

    it('renders error modal correctly', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ErrorModal error={error}/>
            </LocaleContext.Provider>
        );

        expect(screen.getByText(localeContext.language.translate('common.error_heading'))).toBeInTheDocument();
    });

    it('hides error modal if there is no error', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ErrorModal />
            </LocaleContext.Provider>
        );
        // eslint-disable-next-line testing-library/no-node-access
        expect(document.querySelector(".modal--error")).not.toBeInTheDocument();
    });

    it('renders request ID if available', () => {
        error = {
            type: 'request',
            headers: { 'x-request-id': 'foobar' },
        } as unknown as RequestError;

        render(
            <LocaleContext.Provider value={localeContext}>
                <ErrorModal error={error} />
            </LocaleContext.Provider>
        );

        expect(screen.getByText('foobar')).toBeInTheDocument();
    });

    it('overrides error message', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ErrorModal error={error} message="error message" />
            </LocaleContext.Provider>
        );

        expect(screen.getByText('error message')).toBeInTheDocument();
    });

    it('overrides error title', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ErrorModal error={error} title="error title" />
            </LocaleContext.Provider>
        );

        expect(screen.getByText('error title')).toBeInTheDocument();
    });

    it('onClose is called when button is clicked', async () => {
        const modalOnClose = jest.fn();

        render(
            <LocaleContext.Provider value={localeContext}>
                <ErrorModal error={error} onClose={modalOnClose} />
            </LocaleContext.Provider>
        );

        await userEvent.click(screen.getByRole('button', {
            name: localeContext.language.translate('common.ok_action')
        }));

        expect(modalOnClose).toHaveBeenCalled();
    });

    it('does not show error code if prop if false', () => {
        error = {
            type: 'request',
            headers: { 'x-request-id': 'foobar' },
        } as unknown as RequestError;

        render(
            <LocaleContext.Provider value={localeContext}>
                <ErrorModal error={error} shouldShowErrorCode={false} />
            </LocaleContext.Provider>
        );

        expect(screen.queryByText('foobar')).not.toBeInTheDocument();
    });

    it('renders html error correctly', () => {
        error = new CustomError({
            data: {
                shouldBeTranslatedAsHtml: true,
                translationKey: 'payment.ratepay.errors.paymentSourceInfoCannotBeVerified',
            }
        });

        render(
            <LocaleContext.Provider value={localeContext}>
                <ErrorModal error={error} shouldShowErrorCode={false} />
            </LocaleContext.Provider>
        );

        expect(screen.getByRole('link', { name: 'Ratepay Data Privacy Statement' })).toBeInTheDocument()
    });
});