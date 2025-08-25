import classNames from 'classnames';
import React, { type FunctionComponent } from 'react';

interface ModalHeaderProps {
    children: React.ReactNode;
    additionalClassName?: string;
}

const ModalHeader: FunctionComponent<ModalHeaderProps> = ({ children, additionalClassName }) => (
    <h2
        className={classNames(
            'modal-header-title optimizedCheckout-headingSecondary',
            additionalClassName,
        )}
        data-test="modal-heading"
    >
        {children}
    </h2>
);

export default ModalHeader;
