import React from 'react';
import PropTypes from 'prop-types';

const DriveLogo = ({ planName = '', className = 'logo' }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox={`0 0 92.5 ${planName === '' ? '15.1' : '22'}`}
            className={className}
            aria-labelledby="logo__title plan"
        >
            <g>
                <path d="M20.4,3.6h-3v11.2h1.9v-4h1.1c1.1,0.1,2.2-0.2,3.1-0.9c0.9-0.6,1.4-1.7,1.3-2.7C24.8,4.9,23.3,3.6,20.4,3.6z M19.3,5.2h1.1c1.6,0,2.4,0.6,2.4,2c0.1,0.6-0.2,1.2-0.6,1.7c-0.6,0.2-1.2,0.4-1.8,0.3h-1.1V5.2z" />
                <path d="M30.2,6c-0.9,0-1.7,0.5-2.1,1.2L28,6.1h-1.6v8.6h1.9V9.9c0.3-1.5,0.9-2.1,1.7-2.1c0.2,0,0.4,0,0.7,0.1L30.9,8l0.3-1.8H31C30.7,6,30.4,6,30.2,6z" />
                <path d="M35.5,6c-1.1,0-2.2,0.4-2.9,1.3c-1.3,2-1.4,4.5,0,6.5c1.5,1.6,3.9,1.7,5.5,0.2c0.1-0.1,0.2-0.1,0.2-0.2c1.3-2,1.3-4.5,0-6.5C37.7,6.4,36.6,5.9,35.5,6z M35.5,13.4c-1.3,0-1.9-1-1.9-2.9c-0.1-0.8,0.1-1.6,0.5-2.3c0.3-0.5,0.9-0.7,1.4-0.7s1.1,0.2,1.4,0.7c0.4,0.7,0.6,1.5,0.5,2.2C37.4,12.4,36.8,13.4,35.5,13.4z" />
                <path d="M45,13c-0.3,0.2-0.6,0.3-1,0.3c-0.5,0-0.8-0.2-0.8-1V7.7H45l0.2-1.5h-2V4.1l-1.9,0.2v1.8H40v1.5h1.4v4.7c0,0.7,0.2,1.4,0.6,1.9c0.5,0.5,1.1,0.7,1.8,0.7s1.4-0.2,2-0.6l0.2-0.1l-0.7-1.3L45,13z" />
                <path d="M50.1,6c-1.1,0-2.2,0.4-2.9,1.3c-1.3,2-1.3,4.5,0,6.5c1.5,1.6,3.9,1.7,5.5,0.2c0.1-0.1,0.2-0.1,0.2-0.2c1.3-2,1.3-4.5,0-6.5C52.3,6.4,51.2,5.9,50.1,6z M50.1,13.4c-1.3,0-1.9-1-1.9-2.9c-0.1-0.8,0.1-1.6,0.5-2.3c0.3-0.5,0.9-0.7,1.4-0.7s1.1,0.2,1.4,0.7c0.4,0.7,0.5,1.5,0.5,2.3C52,12.4,51.4,13.4,50.1,13.4z" />
                <path d="M60,6c-0.5,0-1.1,0.1-1.6,0.4c-0.3,0.2-0.6,0.4-0.8,0.6l-0.1-0.9h-1.6v8.6h1.9v-6c0.6-0.9,1.1-1.3,1.9-1.3c0.6,0,1.1,0.2,1.1,1.4v5.9h1.9v-6c0-0.7-0.2-1.4-0.7-2C61.4,6.2,60.7,5.9,60,6z" />
                <path d="M71.4,4.6c-1.1-0.8-2.5-1.1-3.8-1h-2.5v11.2h2.8c1.3,0.1,2.5-0.3,3.5-1.1c1.2-1.2,1.9-2.8,1.7-4.5c0-1-0.1-1.9-0.5-2.8C72.4,5.7,72,5.1,71.4,4.6z M68,13.2h-1v-8h0.9c0.8-0.1,1.6,0.2,2.2,0.6c0.8,0.9,1.2,2.1,1,3.3C71.2,12.8,69.4,13.2,68,13.2L68,13.2z" />
                <path d="M78.8,6c-0.9,0-1.7,0.5-2.1,1.2l-0.1-1.1H75v8.6h1.9V9.9c0.3-1.5,0.9-2.1,1.7-2.1c0.2,0,0.4,0,0.7,0.1L79.5,8l0.3-1.8h-0.2C79.4,6,79.1,6,78.8,6z" />
                <path d="M82,2.2c-0.7,0-1.2,0.5-1.2,1.2c0,0.3,0.1,0.6,0.3,0.8c0.2,0.2,0.5,0.3,0.9,0.3c0.7,0,1.2-0.5,1.2-1.2C83.2,2.8,82.7,2.2,82,2.2L82,2.2z" />
                <rect x="81.1" y="6.1" width="1.9" height="8.6" />
                <path d="M88.1,12.6l-2-6.4h-2l3,8.6h2L92,6.1h-2L88.1,12.6z" />
                <path d="M98.7,7.1c-0.3-0.4-0.7-0.7-1.1-0.9c-0.5-0.2-1-0.3-1.5-0.3c-1.1,0-2,0.5-2.7,1.3c-0.7,1-1,2.1-1,3.3c-0.1,1.2,0.3,2.3,1,3.2c0.7,0.8,1.8,1.2,2.8,1.2c1.1,0,2.2-0.4,3-1.1l0.2-0.1l-0.9-1.2l-0.2,0.1c-0.6,0.4-1.3,0.7-2,0.7c-1.1,0-1.8-0.7-2-2.2h5.2v-0.2c0-0.1,0-0.4,0-0.7C99.7,9.1,99.4,8,98.7,7.1z M94.4,9.7c0-0.6,0.2-1.1,0.5-1.6c0.3-0.4,0.7-0.6,1.2-0.5c0.5,0,1,0.2,1.3,0.6c0.3,0.5,0.5,1,0.4,1.6L94.4,9.7z" />
            </g>
            <g>
                <path d="M9.6,4.5H9.5C8.8,2.7,6.7,1.7,4.9,2.4c-1,0.4-1.8,1.2-2.1,2.2C1.1,4.8-0.1,6.2,0,7.8c0.1,1.5,1.4,2.7,3,2.7h2.1V9.2H3.5l2.8-2.8l2.8,2.8H7.5v1.4H5.1V12H3.5l2.8,2.8L9.1,12H7.5v-1.4h2.2l0,0c1.7-0.1,3-1.5,2.9-3.2C12.5,5.8,11.2,4.5,9.6,4.5L9.6,4.5z" />
            </g>
            <title id="logo__title">ProtonDrive</title>
            {planName ? (
                <text
                    textAnchor="start"
                    className={`plan fill-${planName} uppercase bold`}
                    x="16"
                    y="22"
                    id="plan"
                    focusable={false}
                >
                    {planName}
                </text>
            ) : null}
        </svg>
    );
};

DriveLogo.propTypes = {
    planName: PropTypes.string,
    className: PropTypes.string
};

export default DriveLogo;
