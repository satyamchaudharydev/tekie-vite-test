import React from 'react'
import styles from "../styles.module.scss";
import LoadingSpinner from '../../TeacherApp/components/Loader/LoadingSpinner';
import {AnimatePresence, motion} from 'framer-motion'
import { hs } from '../../../utils/size';

function AutoSave({showSave,isSave}) {
  return (
     <motion.div
        key={isSave}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.saveCodingLoading}>
        <p
          className={isSave && "save-coding__loading"}
        >
          {!isSave ? "Saved" : "Saving"}
        </p>
        <div className={styles.saveCodeState}>
          {!isSave ? (
            <div className={styles.checkIconWrapper}>
                <svg  viewBox="0 0 18 18" fill="none" >
                <rect width="18" height="18" rx="9" fill="#01AA93"/>
                <path d="m3.882 9.523 2.842 2.608 6.129-7.445"
                  stroke="#FAFAFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          ) : (
            <LoadingSpinner height={hs(20)}width={hs(20)}color='#00ADE6' />
          )}
        </div>
      </motion.div>
  )
}

export default AutoSave