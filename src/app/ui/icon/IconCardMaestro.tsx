import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconCardMaestro: FunctionComponent = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 131.4 86.9">
        <path fill="#ff5f00" d="M48.4 15.1h34.7v56.6H48.4z" />
        <path fill="#eb001b" d="M52 43.5a36 36 0 0 1 13.7-28.3 36 36 0 1 0 0 56.6 36 36 0 0 1-13.8-28.3z" />
        <path fill="#f79e1b" d="M120.5 65.8v-1.2h.5v-.2h-1.2v.2h.5v1.2zm2.3 0v-1.4h-.3l-.5 1-.4-1h-.3v1.4h.2v-1.1l.4 1h.3l.4-1v1zM124 43.5a36 36 0 0 1-58.3 28.3 36 36 0 0 0 0-56.7 36 36 0 0 1 58.2 28.3z" />
    </svg>
);

export default withIconContainer(IconCardMaestro);
