import React from 'react';

const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l4.661M2.985 19.644A8.25 8.25 0 0115 4.542m0 15.102a8.25 8.25 0 01-12.015-4.542m12.015 0a8.25 8.25 0 00-12.015-4.542" />
  </svg>
);

export default HistoryIcon;
