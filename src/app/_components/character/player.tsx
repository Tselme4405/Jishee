import * as React from "react";
const SvgIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="140"
    height="180"
    fill="none"
    viewBox="0 0 140 180"
  >
    <path
      fill="#F472B6"
      d="M30 20h80v10h20v20h10v80h-10v20h-20v10H30v-10H10v-20H0V50h10V30h20z"
    ></path>
    <path fill="#FDE047" d="M40 0v20h60V0L80 10 70 0 60 10z"></path>
    <path fill="#000" d="M50 70H30v30h20zM110 70H90v30h20z"></path>
    <path fill="#F472B6" d="M50 160H20v20h30zM120 160H90v20h30z"></path>
  </svg>
);

export default SvgIcon;
