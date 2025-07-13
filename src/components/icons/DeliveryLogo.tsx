import React from 'react';

const DeliveryLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 18H3c0-2.5 2-4 2-4" />
    <path d="M19 8h2.79a1 1 0 0 1 .9 1.44l-2.02 4.05" />
    <path d="M14 8h-4.29a1 1 0 0 0-.9.56L7.34 13.5" />
    <path d="M22 18h-7" />
    <path d="M13 18H9" />
    <path d="M17 18a2 2 0 1 0-4 0" />
    <path d="M9 18a2 2 0 1 0-4 0" />
    <path d="M13 13.5H7.5" />
    <path d="m10.5 8-2-2.5" />
    <path d="m7.5 8 2-2.5" />
  </svg>
);

export default DeliveryLogo;
