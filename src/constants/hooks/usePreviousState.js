import React from "react";

// this here gets the previous value of the state

export const usePreviousState = (value) => {
    const ref = React.useRef();
    React.useEffect(() => {
        ref.current = value;
    }, [value]);  
    return ref.current;
}