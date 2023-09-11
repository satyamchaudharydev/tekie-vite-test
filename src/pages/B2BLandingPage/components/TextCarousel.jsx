import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const TextCarousel = ({
  animationSpeedInSec = 1,
  contentArray = [],
  className = "",
  styles
}) => {
  const [index, setIndex] = useState(0);
  const wrappedIndex = index % contentArray.length;

  return (
    <>
      <AnimatePresence initial exitBeforeEnter>
        <motion.div
          key={index}
          className={className}
          style={styles}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            repeat: Infinity,
            repeatDelay: 2,
            opacity: { duration: animationSpeedInSec }
          }}
          onAnimationComplete={() => {
            setIndex(index + 1);
          }}
        >
          {contentArray[wrappedIndex]}
        </motion.div>
      </AnimatePresence>
    </>
  );
};
