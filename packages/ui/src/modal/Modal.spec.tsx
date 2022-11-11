import { mount, shallow } from 'enzyme';
import React from 'react';
import ReactModal from 'react-modal';

import Modal, { ModalProps } from './Modal';
import ModalHeader from './ModalHeader';

describe('Modal', () => {
    let defaultProps: ModalProps;

    beforeEach(() => {
        defaultProps = {
            children: <div>Modal content</div>,
            isOpen: true,
            onRequestClose: jest.fn(),
        };
    });

    it('renders modal window if it is open', () => {
        const component = mount(<Modal {...defaultProps} />);

        expect(component.exists('.modal')).toBe(true);
    });

    it('does not render modal window if it is not open', () => {
        const component = mount(<Modal {...defaultProps} isOpen={false} />);

        expect(component.exists('.modal')).toBe(false);
    });

    it('renders modal with expected class names', () => {
        const component = shallow(<Modal {...defaultProps} />);

        expect(component.find(ReactModal).props()).toEqual(
            expect.objectContaining({
                bodyOpenClassName: 'has-activeModal',
                className: {
                    base: 'modal optimizedCheckout-contentPrimary',
                    afterOpen: 'modal--afterOpen',
                    beforeClose: 'modal--beforeClose',
                },
                overlayClassName: {
                    base: 'modalOverlay',
                    afterOpen: 'modalOverlay--afterOpen',
                    beforeClose: 'modalOverlay--beforeClose',
                },
            }),
        );
    });

    it('notifies parent component when user clicks on close button', () => {
        const component = mount(<Modal {...defaultProps} shouldShowCloseButton={true} />);

        component.find('[data-test="modal-close-button"]').simulate('click');

        expect(defaultProps.onRequestClose).toHaveBeenCalled();
    });

    it('does not close modal when overlay is clicked', () => {
        const component = shallow(<Modal {...defaultProps} />);

        expect(component.find(ReactModal).prop('shouldCloseOnOverlayClick')).toBe(false);
    });

    it('renders modal with header if it is provided', () => {
        const component = mount(
            <Modal {...defaultProps} header={<ModalHeader>Footer</ModalHeader>} />,
        );

        expect(component.find('[data-test="modal-heading"]').text()).toBe('Footer');
    });

    it('renders modal with footer if it is provided', () => {
        const component = mount(<Modal {...defaultProps} footer="Header" />);

        expect(component.find('[data-test="modal-footer"]').text()).toBe('Header');
    });
});
