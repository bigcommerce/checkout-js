import React, { type FunctionComponent } from 'react';

const IconDownArrow: FunctionComponent = () => {
    return (
        <svg
            className="arrow"
            fill="none"
            height="20"
            viewBox="0 0 20 20"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                className="icon-path"
                d="M6.77083 7.50156L10.0042 10.7349L13.2375 7.50156C13.5625 7.17656 14.0875 7.17656 14.4125 7.50156C14.7375 7.82656 14.7375 8.35156 14.4125 8.67656L10.5875 12.5016C10.2625 12.8266 9.7375 12.8266 9.4125 12.5016L5.5875 8.67656C5.2625 8.35156 5.2625 7.82656 5.5875 7.50156C5.9125 7.1849 6.44583 7.17656 6.77083 7.50156Z"
                fill="#979797"
            />
        </svg>
    );
};

export default IconDownArrow;
