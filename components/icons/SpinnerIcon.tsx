import React from 'react';

const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M12 2.5a9.5 9.5 0 100 19 9.5 9.5 0 000-19zM1 .5A11.5 11.5 0 1012 23.5 11.5 11.5 0 001 .5z"
      fill="currentColor"
      fillOpacity="0.2"
    />
    <path
      d="M12 2.5a9.5 9.5 0 10-9.5 9.5A1.5 1.5 0 011 12a11.5 11.5 0 1111.5 11.5.5.5 0 000-1A10.5 10.5 0 1012 1.5a.5.5 0 000-1z"
      fill="currentColor"
    />
  </svg>
);

export default SpinnerIcon;
