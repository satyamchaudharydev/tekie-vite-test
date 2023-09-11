import React from 'react'
import { motion,AnimatePresence } from 'framer-motion'
import UpdatedButton from '../../../../components/Buttons/UpdatedButton/UpdatedButton'

const content = {
  apkFileMax: {
    title: 'Oops..the file seems too big!',
    description: <>The file you are trying to upload is bigger than <span>50mb</span>. Try uploading a smaller file instead.</>,
    },
  fileMax: {
    title: 'Oops..the file seems too big!',
    description: <>The file you are trying to upload is bigger than <span>20mb</span>. Try uploading a smaller file instead.</>,
    },
  delete: {
    title: 'Delete this file?',
    description: 'This file will be deleted and your submission will be removed.'
  },
  link: {
    title: 'Confirm New Submission?',
    description: 'The old submission will be replace with the new one you just created.'

  },
  gsuite: {
    title: 'Delete your submission?',
    description: 'Are you sure you want to delete your submission?'
  },
  resume: {
    title: 'Confirm New Submission?',
    description: 'The old submission will be replace with the new one you just created.'
  }
}
function FileMaxPopup({onCancel,onConfirm,type,deleteLoading,onCancelGsuiteDelete,onConfirmGsuiteDelete,onKeepTheSame,onConfirmReattempt,deleteGsuiteLoading,isKeepTheSameLoading}) {
    return <AnimatePresence>
            <motion.div 
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              className='practice-top-upload-container'>
                  <div className="practice-file-max-modal">

                  <div className='practice-file-max-header'>{content[type].title}</div>
                  <div className="practice-file-max-body">

                  <div className='practice-file-max-desc'>{content[type].description}</div>
                      <div className="practice-file-popup-btns">
                        {(type === 'delete' || type === 'link' ) && (
                          <>
                              <UpdatedButton 
                                type='border' 
                                text='No, Keep it.' 
                                onBtnClick={() => onCancel()}
                                />
                        
                              <UpdatedButton 
                                text='Yes, Confirm' 
                                isLoading={deleteLoading} 
                                loadingType='overlay' 
                                onBtnClick={() => onConfirm()}
                                />
                
                          </>
                        )}
                        {((type === 'fileMax') || (type === 'apkFileMax')) && <UpdatedButton text='Yes, Confirm' onBtnClick={() => onCancel()}></UpdatedButton>}
                        {type === 'gsuite' && 
                          <>
                            <UpdatedButton 
                              type='secondary' 
                              text='No' 
                              onBtnClick={() => onCancelGsuiteDelete()}
                              />
                      
                            <UpdatedButton 
                              text='Yes, Confirm' 
                              isLoading={deleteGsuiteLoading} 
                              loadingType='overlay' 
                              onBtnClick={() => onConfirmGsuiteDelete()}
                              />
                          </>
                        }
                        {/* {type === 'resume' && 
                          <>
                            <UpdatedButton 
                              type='secondary' 
                              text='No, keep the same' 
                              isLoading={isKeepTheSameLoading}
                              leftIcon={true}
                              loadingType='overlay'
                              onBtnClick={() => onKeepTheSame()}
                              />
                      
                            <UpdatedButton 
                              text='Yes, Confirm' 
                              loadingType='overlay' 
                              onBtnClick={() => onConfirmReattempt()}
                              />
                          </>
                        } */}
                      </div>
                  </div>

                  </div>
            </motion.div>
            </AnimatePresence>
  
}

export default FileMaxPopup