import { useState, useEffect } from "react";

function usePrevious(state) {
    let [tuple, setTuple] = useState([null, state]);
  
    if (tuple[1] !== state) {
      setTuple([tuple[1], state]);
    }
    return [tuple[0]];
  }
export default usePrevious;