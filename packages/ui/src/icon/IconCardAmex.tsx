import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconCardAmex: FunctionComponent = () => (
    <svg
        aria-labelledby="iconCardAmexTitle"
        fill="none"
        height="48"
        viewBox="0 0 70 48"
        width="70"
        xmlns="http://www.w3.org/2000/svg"
    >
        <title id="iconCardAmexTitle">Amex</title>
        <rect fill="#016FD0" height="48" rx="6" width="70" />
        <path
            clipRule="evenodd"
            d="M53.1015 24.9034V27.6989H45.9804V29.642H52.9307V32.4375H45.9804V34.3466H53.1015V37.1761L58.8734 31.0398L53.1015 24.9034ZM51.223 14.4375L48.8322 9H42.0015L35 24.8864H40.6866V38.983L58.2416 39L60.991 35.9318L63.7745 39H69V34.517L65.7212 31.0057L69 27.5114V23.0966L65.7042 23.1136V14.625L62.6133 23.1136H59.6077L56.4314 14.5909V23.1136H49.2592L48.2346 20.625H42.5992L41.5746 23.1136H37.7835L43.2993 10.7216V10.7045H47.6539L53.1015 22.9943V10.7045L58.3953 10.7216L61.1276 18.3409L63.894 10.7045H69V9H62.562L61.1105 13.0739L59.659 9H51.223V14.4375ZM42.5821 24.8523V37.2443H53.1015V37.2273H57.439L61.0251 33.2727L64.6454 37.2273H69V37.0568L63.2963 31.0398L69 24.9375V24.8523H64.6966L61.1105 28.7727L57.5585 24.8523H42.5821ZM43.7775 17.8466L45.4169 13.9091L47.0733 17.8466H43.7775Z"
            fill="white"
            fillRule="evenodd"
        />
        <rect height="47" rx="5.5" stroke="#D9D9D9" width="69" x="0.5" y="0.5" />
    </svg>
);

export default withIconContainer(IconCardAmex);
