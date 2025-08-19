import userEvent from '@testing-library/user-event';
import React, { type FunctionComponent } from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import ModalTrigger, { type ModalTriggerModalProps } from './ModalTrigger';

describe('ModalTrigger', () => {
    const Modal: FunctionComponent<ModalTriggerModalProps> = ({ isOpen, onRequestClose }) =>
        isOpen ? (
            <div id="modal">
                <button id="closeButton" onClick={onRequestClose}>
                    Close
                </button>
            </div>
        ) : null;

    it('opens modal window when user clicks on trigger', async () => {
        const { container } = render(
            <ModalTrigger modal={Modal}>
                {({ onClick }) => (
                    <button id="openButton" onClick={onClick}>
                        Open
                    </button>
                )}
            </ModalTrigger>,
        );

        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
        expect(container.querySelector('#modal')).toBeNull();

        await userEvent.click(screen.getByText('Open'));

        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
        expect(container.querySelector('#modal')).not.toBeNull();
    });

    it('closes modal window when "onRequestClose" is called', async () => {
        const { container } = render(
            <ModalTrigger modal={Modal}>
                {({ onClick }) => (
                    <button id="openButton" onClick={onClick}>
                        Open
                    </button>
                )}
            </ModalTrigger>,
        );

        await userEvent.click(screen.getByText('Open'));

        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
        expect(container.querySelector('#modal')).not.toBeNull();

        await userEvent.click(screen.getByText('Close'));

        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
        expect(container.querySelector('#modal')).toBeNull();
    });

    it('opens modal window when focused and enter is pressed', async () => {
        const { container } = render(
            <ModalTrigger modal={Modal}>
                {({ onKeyPress }) => (
                    <button id="openButton" onKeyPress={onKeyPress}>
                        Open
                    </button>
                )}
            </ModalTrigger>,
        );

        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
        expect(container.querySelector('#modal')).toBeNull();

        await userEvent.keyboard('{tab}');
        await userEvent.keyboard('{enter}');

        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
        expect(container.querySelector('#modal')).not.toBeNull();
    });
});
