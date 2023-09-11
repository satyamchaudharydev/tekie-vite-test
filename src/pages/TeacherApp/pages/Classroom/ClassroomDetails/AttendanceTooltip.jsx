import React, { useState } from "react";
import styles from "./classroomDetails.module.scss";
import cx from "classnames";

//NEED TO MAKE THIS REUSABLE
const AttendanceTooltip = ({
    delay,
    children,
    content,
    direction,
    hideDelay,
    customStyles,
    tipColor
  }) => {
    let showTimeout;
    let hideTimeout;
    const [active, setActive] = useState(false);
  
    const showTip = () => {
      clearTimeout(hideTimeout) //prevents hiding tooltip if user quickly does mouseenter and mouseleave
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
  
    return (
      <div
        className={styles.tooltipWrapper}
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
      >
        {children}
        {active && (
          <div
            style={customStyles ? customStyles : {}}
            onMouseEnter={() => clearTimeout(hideTimeout)}
            className={cx(styles.tooltipTip,`${tipColor && styles.tipColor}`, styles[direction] || styles.bottom)}
          >
            {content}
          </div>
        )}
      </div>
    );
  };



export default AttendanceTooltip
