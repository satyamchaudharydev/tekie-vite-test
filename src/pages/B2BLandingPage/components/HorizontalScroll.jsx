import React, { useState, useEffect, useRef } from "react";
import { get } from 'lodash'

import '../styles.scss'

const calcDynamicHeight = (objectWidth) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return objectWidth - vw + vh - 50;
};

const handleDynamicHeight = (ref, setDynamicHeight) => {
  const objectWidth = get(ref.current, 'scrollWidth', 0) || 0;
  const dynamicHeight = calcDynamicHeight(objectWidth);
  setDynamicHeight(dynamicHeight);
};

const applyScrollListener = (ref, setTranslateX) => {
  window.addEventListener("scroll", () => {
    if (ref.current && ref.current.offsetTop) {
      const offsetTop = -ref.current.offsetTop;
      setTranslateX(offsetTop);
    }
  });
};

export default ({ headerEl, children, footerEl }) => {
  const [dynamicHeight, setDynamicHeight] = useState(null);
  const [translateX, setTranslateX] = useState(0);

  const containerRef = useRef(null);
  const objectRef = useRef(null);

  const resizeHandler = () => {
    handleDynamicHeight(objectRef, setDynamicHeight);
  };

  useEffect(() => {
    handleDynamicHeight(objectRef, setDynamicHeight);
    window.addEventListener("resize", resizeHandler);
    applyScrollListener(containerRef, setTranslateX);
  }, []);

  return (
    <div style={{
      height: `${dynamicHeight}px`,
      position: 'relative',
      width: '100%',
    }}>
      <div className='b2b-landing-page-testimonial-stickyContainer' ref={containerRef}>
        {headerEl}
        <div style={{
            transform: `translateX(${translateX}px)`,
            position: 'absolute',
            height: '100%',
            willChange: 'transform',
          }}
          ref={objectRef}
        >
          {children}
        </div>
        {footerEl}
      </div>
    </div>
  );
};
