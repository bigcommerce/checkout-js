import classNames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';

interface ModalHeaderProps {
    children?: ReactNode;
    additionalClassName?: string;
}

const newFontStyle = true; // Assuming this is a placeholder for the actual condition

const ModalHeader: FunctionComponent<ModalHeaderProps> = ({ children, additionalClassName }) => (
    <h2
        className={classNames(
            'modal-header-title optimizedCheckout-headingSecondary',
            additionalClassName,
            { 'header-secondary': newFontStyle },
        )}
        data-test="modal-heading"
    >
        {children}
    </h2>
);

export default ModalHeader;
