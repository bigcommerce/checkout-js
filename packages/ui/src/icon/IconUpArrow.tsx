import React, { type FunctionComponent } from 'react';

const IconUpArrow: FunctionComponent = () => {
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
                d="M6.77083 12.4984L10.0042 9.26506L13.2375 12.4984C13.5625 12.8234 14.0875 12.8234 14.4125 12.4984C14.7375 12.1734 14.7375 11.6484 14.4125 11.3234L10.5875 7.4984C10.2625 7.1734 9.7375 7.1734 9.4125 7.4984L5.5875 11.3234C5.2625 11.6484 5.2625 12.1734 5.5875 12.4984C5.9125 12.8151 6.44583 12.8234 6.77083 12.4984Z"
                fill="#979797"
            />
        </svg>
    );
};

export default IconUpArrow;
