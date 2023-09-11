import * as React from "react";

function Close(props) {
  return (
    <svg viewBox="0 0 21 21" {...props}>
      <path
        d="M21 2.115L18.885 0 10.5 8.385 2.115 0 0 2.115 8.385 10.5 0 18.885 2.115 21l8.385-8.385L18.885 21 21 18.885 12.615 10.5z"
        fill={props.fill || "#fff"}
        opacity={0.6}
      />
    </svg>
  );
}

const MemoClose = React.memo(Close);
export default MemoClose;
