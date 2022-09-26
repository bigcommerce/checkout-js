import { RequestError } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { getStoreConfig } from '../../config/config.mock';
import { AccountCreationFailedError } from '../../guestSignup/errors';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';

import ErrorCode from './ErrorCode';
import ErrorModal, { ErrorModalProps } from './ErrorModal';

describe('ErrorModal', () => {
    let errorModal: ReactWrapper;
    let localeContext: LocaleContextType;
    let error: Error | RequestError;
    const onClose = jest.fn();

    const ErrorModalContainer = (props: ErrorModalProps) => (
        <LocaleContext.Provider value={localeContext}>
            <ErrorModal onClose={onClose} {...props} />
        </LocaleContext.Provider>
    );

    beforeEach(() => {
        error = new Error('Foo');

        localeContext = createLocaleContext(getStoreConfig());
        errorModal = mount(<ErrorModalContainer error={error} />);
    });

    it('renders error modal', () => {
        expect(errorModal.find(Modal).prop('isOpen')).toBeTruthy();
        expect(errorModal.find(ErrorModal).html()).toMatchSnapshot();
    });

    it('hides error modal if there is no error', () => {
        errorModal = mount(<ErrorModalContainer />);

        expect(errorModal.find(Modal).prop('isOpen')).toBeFalsy();
    });

    it('renders error code', () => {
        expect(errorModal.find(ErrorCode)).toHaveLength(1);
    });

    it('renders request ID if available', () => {
        error = {
            type: 'request',
            headers: { 'x-request-id': 'foobar' },
        } as unknown as RequestError;

        errorModal = mount(<ErrorModalContainer error={error} />);

        expect(errorModal.find(ErrorCode).text()).toBe('Request ID: foobar');
    });

    it('overrides error message', () => {
        errorModal = mount(<ErrorModalContainer error={error} message="Hello world" />);

        expect(errorModal.find('[data-test="modal-body"]').text()).toContain('Hello world');
    });

    it('overrides error title', () => {
        errorModal = mount(<ErrorModalContainer error={error} title="Hello world" />);

        expect(errorModal.find('[data-test="modal-heading"]').text()).toContain('Hello world');
    });

    describe('when modal is closed', () => {
        beforeEach(() => {
            errorModal.find(Button).simulate('click');
        });

        it('calls `onAfterClose` callback with event and error object', async () => {
            await new Promise((resolve) => process.nextTick(resolve));

            expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }), {
                error,
            });
        });

        describe('when the error is updated', () => {
            beforeEach(() => {
                errorModal.setProps({
                    error: new AccountCreationFailedError(new Error()),
                    shouldShowErrorCode: false,
                });
                errorModal.update();
            });

            it('reopens modal', () => {
                expect(errorModal.find(Modal).prop('isOpen')).toBeTruthy();
            });

            it('closes modal when error is cleared', () => {
                errorModal.setProps({ error: null });
                errorModal.update();

                expect(errorModal.find(Modal).prop('isOpen')).toBeFalsy();
            });

            it('does not render error code', () => {
                expect(errorModal.find(ErrorCode)).toHaveLength(0);
            });
        });
    });
});
