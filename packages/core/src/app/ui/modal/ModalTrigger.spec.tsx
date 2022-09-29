import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import ModalTrigger, { ModalTriggerModalProps } from './ModalTrigger';

describe('ModalTrigger', () => {
    const Modal: FunctionComponent<ModalTriggerModalProps> = ({ isOpen, onRequestClose }) =>
        isOpen ? (
            <div id="modal">
                <button id="closeButton" onClick={onRequestClose}>
                    Close
                </button>
            </div>
        ) : null;

    it('opens modal window when user clicks on trigger', () => {
        const component = mount(
            <ModalTrigger modal={Modal}>
                {({ onClick }) => (
                    <button id="openButton" onClick={onClick}>
                        Open
                    </button>
                )}
            </ModalTrigger>,
        );

        expect(component.find('#modal')).toHaveLength(0);

        component.find('#openButton').simulate('click');

        expect(component.find('#modal')).toHaveLength(1);
    });

    it('closes modal window when "onRequestClose" is called', () => {
        const component = mount(
            <ModalTrigger modal={Modal}>
                {({ onClick }) => (
                    <button id="openButton" onClick={onClick}>
                        Open
                    </button>
                )}
            </ModalTrigger>,
        );

        component.find('#openButton').simulate('click');

        component.find('#closeButton').simulate('click');

        expect(component.find('#modal')).toHaveLength(0);
    });

    it('opens modal window when focused and enter is pressed', () => {
        const component = mount(
            <ModalTrigger modal={Modal}>
                {({ onKeyPress }) => (
                    <button id="openButton" onKeyPress={onKeyPress}>
                        Open
                    </button>
                )}
            </ModalTrigger>,
        );

        expect(component.find('#modal')).toHaveLength(0);

        component.find('#openButton').simulate('keypress', { key: 'Enter' });

        expect(component.find('#modal')).toHaveLength(1);
    });
});
