import { useState, useCallback, useRef, useEffect } from "react";

function useMeasure() {
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const ref = useRef(null);

  const measure = useCallback(() => {
    if (!ref.current) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    setRect({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, []);

  return [ref, rect, measure];
}

export default useMeasure;
