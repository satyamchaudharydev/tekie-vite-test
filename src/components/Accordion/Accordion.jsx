import React from 'react';
import { motion, AnimatePresence } from "framer-motion";

const Accordion = ({ key, expanded, setExpanded, text }) => {
    console.log({ key, expanded, setExpanded, text });
  const isOpen = key === expanded;
  return (
    <>
      <motion.header
        initial={false}
        style={{ height: "100%" }}
        animate={{ backgroundColor: isOpen ? "#FF0088" : "#0055FF" }}
        onClick={() => setExpanded(isOpen ? false : key)}
      />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.section
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            {text}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};

export default Accordion;