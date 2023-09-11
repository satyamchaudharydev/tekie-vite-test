import React, { useState } from "react";
import styles from "./Tooltip.module.scss";
import cx from 'classnames'
import { useEffect } from "react";
import { createPortal } from "react-dom";
import hs from "../../utils/scale";

const beack = (type) => <svg className={type === 'tertiary' ? styles.tertiaryTip :styles.tip} width="24" height="14" viewBox="0 0 24 14" fill="none">
<path d="M24 14C24 14 -2.23141 13.9999 0.153267 14C2.53794 14.0001 4.92261 14.0001 8.49962 11.0001C10.872 9.01036 16.9158 3.94146 20.7174 0.753063C22.0189 -0.338486 24 0.589052 24 2.28768V14Z" fill={type === 'tertiary' ? '#F0FBFF': "currentColor"}/>
</svg>

const Tooltip = ({ delay, children, content, direction,tooltipClassName,type = 'default',show = false, newFlow = true,showFromProps,showClick=true,onClose=() => {},hide= false,overlay=false}) => {
  let timeout;
  const [active, setActive] = useState(false);
  const [isClicked, setIsClicked] = useState(false);


  const domRef = React.useRef();
  
  useEffect(() => {
    if(hide){
      setActive(false)
    }
  }, [hide])


  useOnClickOutside(domRef, () => {
    onClose()
    hideTip(true)
 
  });
  const showTip = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      setActive(true);
    }, delay || 400);
  };

  const hideTip = () => {
   clearTimeout(timeout);
   !isClicked && setActive(false);
  };
  const isShowTip = () => {
    if(showFromProps) return show
    return active
  }
 
  return (
    <>
     <div
      className={cx(styles.tooltipWrapper, newFlow ? styles.newFlow : '')}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      ref={domRef}
      onClick={() => {
        if(showClick){
          if(isClicked){
            hideTip()
            setIsClicked(false)
          }else{
            showTip()
            setIsClicked(true)
          }
        }
      

      }}
      >
      <div>
        {children}
      </div>
      {isShowTip() && (
        <>
        {}
        <div 
          className={cx('tooltip-wrapper',styles.tooltipTip, type === 'tertiary' && styles.tertiary,type === 'secondary' && styles.secondary,styles[direction] || styles.top ,tooltipClassName && tooltipClassName)}
          style={{left: type === 'tertiary' && `${hs(60)}`, borderRadius: type === 'tertiary' && `${hs(12)}`,backgroundColor: type === 'tertiary' && '#F0FBFF'}}
          >
          {content}
          {newFlow && beack(type)}
        </div>
        
        </>

      )}
    </div>
    {
      overlay && <Overlay
      show={isShowTip()}
      onClose={() => {
        onClose()
        setActive(false)
      }
    }
      >

    </Overlay>
    }
   
    </>
   
  );
};
function useOnClickOutside(ref, handler) {
  React.useEffect(
    () => {
      const listener = (event) => {
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
const Overlay = ({show,onClose = () => {}}) => {
 if(!show) return null
  return createPortal(
      <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'transparent',
      }}
      
        
      ></div>, document.body
    )
}

export default Tooltip;