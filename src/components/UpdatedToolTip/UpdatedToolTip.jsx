import React, { useState } from "react";
import styles from "./UpdatedToolTip.module.scss";
import cx from "classnames";

const bottomLeftTip = (tipColor) => (
  <svg width="24" height="14" fill="#000" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 5.46901e-07C0 5.46901e-07 26.2314 6.15821e-05 23.8467 5.46901e-07C21.4621 -6.04883e-05 19.0774 -6.05583e-05 15.5004 2.99994C13.128 4.98964 7.08418 10.0585 3.28256 13.2469C1.98107 14.3385 0 13.4109 0 11.7123V5.46901e-07Z" fill={tipColor}/>
  </svg>
)

const UpdatedToolTip = ({
    delay,
    children,
    content,
    direction='bottomLeft',
    hideDelay,
    customStyles,
    tipColor='#4A336C',
    isShowTooltip = false,
    fromProgress
  }) => {
    let showTimeout;
    let hideTimeout;
    const [active, setActive] = useState(false);
  
    const showTip = () => {
      clearTimeout(hideTimeout)
      showTimeout = setTimeout(() => {
        setActive(true);
      }, delay || 400);
    };
  
    const hideTip = () => {
      hideTimeout = setTimeout(() => {
        clearInterval(showTimeout);
        setActive(false);
      }, hideDelay);
    };

    const isShowTip = () => {
      if(fromProgress) return isShowTooltip
      return active
    }
  
    return (
      <div
        className={styles.tooltipWrapper}
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
      >
        {children}
        {isShowTip() && (
            <>
                <div
                    style={customStyles ? customStyles : {}}
                    onMouseEnter={() => clearTimeout(hideTimeout)}
                    className={cx(styles.tooltipTip, `${direction ? styles['tooltip'+direction] : styles.bottomLeft}`)}
                >
                    {content}
                </div>
                <span
                    className={cx(`${direction ? styles[direction] : styles.bottomLeft}`)}
                >
                    {bottomLeftTip(tipColor)}
                </span>
            </>
        )}
      </div>
    );
  };



export default UpdatedToolTip
