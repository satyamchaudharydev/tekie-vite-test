import React, { useEffect } from "react";

/**
 * Hook that detects clicks outside of the passed ref
 * @param {React.MutableRefObject} ref - The ref to check for clicks outside of
 * @param {Function} handler - The function to call when a click is outside the ref
 * @see https://usehooks.com/useOnClickOutside/
 * @see https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
*/


function useOnClickOutside(ref, handler) {
  useEffect(
    () => {
      const listener = (event) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }

        handler(event);
      };

      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);

      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    [ref, handler]
  );
}
export default useOnClickOutside;
