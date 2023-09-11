import React from 'react'
import { Loader } from "./PracticeSubmission";
import { ReactComponent as Close } from "../assets/close.svg";
import {motion} from 'framer-motion'

function DeleteButton({onDelete,isDelete}) {
  return (
    <motion.div
    whileTap={{ scale: 0.95 }}
    initial={{scale: 0}}
    animate={{scale: 1}}
    exit={{scale: 0}}
    style={{pointerEvents: isDelete ? 'none' : 'auto'}}

          className="practice-file-preview--remove-preview"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete()}}
        >
          {isDelete ? <Loader size="small" /> : <Close></Close>}
        </motion.div>
  )
}

export default DeleteButton