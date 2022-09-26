import React, { FunctionComponent, ReactNode, useCallback } from 'react';

import { preventDefault } from '../../common/dom';
import { TranslatedString } from '../../locale';
import { Button, ButtonSize } from '../button';

import Modal from './Modal';
import './ModalLink.scss';
import ModalTrigger, { ModalTriggerModalProps } from './ModalTrigger';

export interface ModalLinkProps {
    header: ReactNode;
    body: ReactNode;
}

const ModalLink: FunctionComponent<ModalLinkProps> = ({ children, body, header }) => {
    const renderModal = useCallback(
        (props: ModalTriggerModalProps) => (
            <Modal
                {...props}
                additionalBodyClassName="modal--withText"
                footer={
                    <Button onClick={props.onRequestClose} size={ButtonSize.Small}>
                        <TranslatedString id="common.ok_action" />
                    </Button>
                }
                header={header}
                shouldShowCloseButton={true}
            >
                {body}
            </Modal>
        ),
        [header, body],
    );

    return (
        <ModalTrigger modal={renderModal}>
            { }
            {({ onClick }) => <a onClick={preventDefault(onClick)}>{children}</a>}
        </ModalTrigger>
    );
};

export default ModalLink;
