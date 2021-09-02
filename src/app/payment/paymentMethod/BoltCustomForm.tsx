import React, { FunctionComponent } from 'react';

export interface BoltCustomFormProps {
    containerId: string;
}

const BoltCustomForm: FunctionComponent<BoltCustomFormProps> = ({ containerId }) => {
    return (
        <div className="form-ccFields">
            <div
                className="form-field form-field--bolt-embed"
                id={ containerId }
            />
        </div>
    );
};

export default BoltCustomForm;
