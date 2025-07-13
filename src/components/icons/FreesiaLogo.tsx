import React from 'react';

const FreesiaLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 25"
    width="150"
    height="37.5"
    {...props}
  >
    <style>
      {`
        .font { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: bold; fill: #333; }
      `}
    </style>
    <text x="0" y="20" className="font">Freesia Finds</text>
  </svg>
);

export default FreesiaLogo;
