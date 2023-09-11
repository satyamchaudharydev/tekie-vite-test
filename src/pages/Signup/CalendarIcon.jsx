import * as React from "react";

function CalendarIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <path
        d="M4.125 2.5H7V1a1 1 0 012 0v1.5h14V1a1 1 0 012 0v1.5h2.875A4.13 4.13 0 0132 6.625v21.25A4.13 4.13 0 0127.875 32H4.125A4.13 4.13 0 010 27.875V6.625A4.13 4.13 0 014.125 2.5zM2 27.875C2 29.049 2.951 30 4.125 30h23.75A2.125 2.125 0 0030 27.875V11.312a.312.312 0 00-.313-.312H2.313a.313.313 0 00-.312.313v16.562z"
        fill="#fff"
      />
    </svg>
  );
}

const MemoCalendarIcon = React.memo(CalendarIcon);
export default MemoCalendarIcon;
