import React from 'react'
import { useState,useRef } from 'react'
import Button from '../../pages/TeacherApp/components/Button/Button'
import UpdatedButton from '../Buttons/UpdatedButton/UpdatedButton'
import './homework.scss'
import { fetchHomeworkDetails, filteredComponentsLink, updateHomeworkAttempted } from '../NextFooter/utils'
import { useHistory } from 'react-router'
import { useEffect } from 'react'
import { get, isEmpty } from 'lodash'
import {motion} from 'framer-motion'
import Skeleton from '../../pages/UpdatedSessions/Practice/skeleton'
import duck from '../../duck'

export const getProgressFromHomework = (homeWorkMetaData) => {
    let totalHomework = 0
    let attemptedHomework = 0
    let progress = 0
    if(!isEmpty(homeWorkMetaData)){
        
        for (const key in homeWorkMetaData) {
            if (Object.hasOwnProperty.call(homeWorkMetaData, key)) {
                const element = homeWorkMetaData[key];
                const {attempted,total} = element
                totalHomework += total
                attemptedHomework += attempted
            }
        }
    }
    progress = (attemptedHomework/totalHomework) * 100
    return {
        progress,
        totalHomework,
        attemptedHomework,
    }
}

function HomeworkProgress(
    {
        topicId,
        courseId,
        showSubmit = true,
        homeWorkMeta,
        fromSubmitModal = false,
        topic,
        onSubmit = () => {},
        ...props
    }) {
    const [homeworkLoading,setHomeworkLoading] = useState(true)

    const history = useHistory()
    const isRevisit = history.location.pathname.includes('revisit')
    const homeWorkMetaData = homeWorkMeta && homeWorkMeta.toJS()
 
    if( homeWorkMetaData && homeWorkMetaData.length > 0){
        const data = {
            totalQuestions:0,
            totalAttempted:0,
        }
            homeWorkMetaData.forEach(meta => {
                const {attempted,total} = meta
                data.totalQuestions += total
                data.totalAttempted += attempted
            }
            )
    }
            

    useEffect( async () => {
        if(fromSubmitModal) return
        setHomeworkLoading(true)
        
        const response = await fetchHomeworkDetails({
                    courseId: courseId,
                    topicId,
                    isRevisit,
                    topic
                })
                    duck.merge(() => ({
                            homeWorkMeta: response,
                            }),
                            {
                                key : 'homeWorkMeta'
                            }
                    )     
        setHomeworkLoading(false)
        
        
    }, [])


    
    const {progress,totalHomework,attemptedHomework} = getProgressFromHomework(homeWorkMetaData)
    const progressText = `${attemptedHomework}/${totalHomework} ${fromSubmitModal ? 'Attempted' : ''}`
    const isLoading = homeworkLoading || fromSubmitModal
    if(totalHomework === 0) return null
    const renderProgress = () => {
        if(fromSubmitModal){
            return <>
                 <div className={`hp-container--progress ${fromSubmitModal ? 'fromSubmit' : ''}`}>
                    <div className="hp-container--progress--bar">
                        <motion.div 
                            initial={{
                                width: 0,
                            }}
                            animate={{
                                width: `${progress}%`,
                            }}
                            transition={{
                                type: 'ease',
                                duration: 0.5,
                            }}
                            className="hp-container--progress--bar--fill"
                            >
                        </motion.div>
                    </div>
                    <div className="hp-container--progress--text">{progressText}</div>
                

                </div>
            
            </>
        }
        else{
            return <>
                <div className="hp-container--title">Homework Progress</div>
                <div className="hp-container--progress">
                    <div className="hp-container--progress--bar">
                        {
                            isLoading ? <>
                                <div className='hp-container--progress-loading'>
                                    <Skeleton fullSize></Skeleton>
                                </div>
                            </>
                            : <motion.div 
                                initial={{
                                    width: 0,
                                }}
                                animate={{
                                    width: `${progress}%`,
                                }}
                                transition={{
                                    type: 'ease',
                                    duration: 0.5,
                                }}
                                className="hp-container--progress--bar--fill"
                                >
                            </motion.div>
                        }
                        
                    </div>
                    <div className="hp-container--progress--text">{ !isLoading ? progressText : ''}</div>
                

                </div>
                {
                    
                }
                {(showSubmit && !isLoading) &&
                    <UpdatedButton
                        text='Submit Homework'
                        type='secondary'
                        skeletonLoading={isLoading}
                        wrapperClass="hp-container--button"
                        noShadow
                        rounded
                        onBtnClick={() => {
                            
                            onSubmit()}}
                        />
                 }
                {(showSubmit && isLoading) &&
                    <div className='submit-btn-skeleton'>
                        <Skeleton fullSize ></Skeleton>
                    </div>
                 }
                        
             </>
        }
    }
  return (
     <div className={`hp-container ${homeworkLoading ? 'loading' : ''} ${fromSubmitModal ? 'fromSubmit' : ''}`}>
     
       {renderProgress()}
            
        
    </div>
    
   
  )
}



export default HomeworkProgress