import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconCardMaestro: FunctionComponent = () => (
    <svg
        aria-labelledby="iconCardMaestroTitle"
        fill="none"
        height="48"
        viewBox="0 0 70 48"
        width="70"
        xmlns="http://www.w3.org/2000/svg"
    >
        <title id="iconCardMaestroTitle">Maestro</title>
        <rect fill="white" height="47" rx="5.5" stroke="#D9D9D9" width="69" x="0.5" y="0.5" />
        <path
            d="M40.1899 24.254C40.1899 31.8788 34.0796 38.0599 26.5423 38.0599C19.005 38.0599 12.8948 31.8788 12.8948 24.254C12.8948 16.6291 19.005 10.448 26.5423 10.448C34.0796 10.448 40.1899 16.6291 40.1899 24.254Z"
            fill="#ED0006"
        />
        <path
            d="M57.8948 24.254C57.8948 31.8788 51.7846 38.0599 44.2472 38.0599C36.7099 38.0599 30.5997 31.8788 30.5997 24.254C30.5997 16.6291 36.7099 10.448 44.2472 10.448C51.7846 10.448 57.8948 16.6291 57.8948 24.254Z"
            fill="#0099DF"
        />
        <path
            clipRule="evenodd"
            d="M35.3948 13.7461C38.3292 16.2784 40.1898 20.0463 40.1898 24.254C40.1898 28.4616 38.3292 32.2295 35.3948 34.7618C32.4605 32.2295 30.5998 28.4616 30.5998 24.254C30.5998 20.0463 32.4605 16.2784 35.3948 13.7461Z"
            fill="#6C6BBD"
            fillRule="evenodd"
        />
    </svg>
);

export default withIconContainer(IconCardMaestro);
