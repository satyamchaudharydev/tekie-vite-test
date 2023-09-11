import React, { useEffect } from 'react'
import {ReactComponent as ChatIcon} from '../chat.svg'
import Lottie from "react-lottie";
import stars from '../stars.json'
import UpdateButton from '../../../components/Buttons/UpdatedButton/UpdatedButton'
import FeedbackIcon from './FeedbackIcon'
import  Tooltip  from '../../Tooltip/Tooltip'
import {AnimatePresence, motion} from 'framer-motion'
import { ArrowForward } from '../../../constants/icons'
import UpdatedButton from '../../../components/Buttons/UpdatedButton/UpdatedButton'
import { get } from 'lodash'
import { feedbackTypes } from '../../NextFooter/utils'
import { useHistory } from 'react-router'

function DefaultView(
    {
        selectedRating,
        feedackComment,
        handleFeedbackComment,
        reviewEval,
        children,
        handleSubmit,
        step,
        type = feedbackTypes.CLASS,
        showFooter,
        setShowFoooter,
        filteredTags,
        handleTags
    }) {
    const history = useHistory()
    const likeRef = React.useRef(null)
    const dislikeRef = React.useRef(null)
    useEffect(() => {
        if(likeRef.current && dislikeRef.current) {
            likeRef.current.addEventListener('animationend', () => {
                likeRef.current.style.animation = ''
            }
            )
            dislikeRef.current.addEventListener('animationend', () => {
                dislikeRef.current.style.animation = ''
            }
            )
        }
    }, [likeRef,dislikeRef])

    const getInfoFromSelectedRating = (item)=> {
        if(item === 'characterImg'){  
            if(selectedRating === 0){                
                return reviewEval[selectedRating - 1][item]
            }
            else{
               return reviewEval[selectedRating - 1][item]
            }
        }
       if(selectedRating === 0) return ''
       else return reviewEval[selectedRating - 1][item]

     
    }
    
   
    const renderFormFooter = (type) => {
        if(type){
            return <motion.div
                        className="sf-form-footer"
                        // initial={{y: '100%',opacity:0.5}}
                        // animate={{y: 0,opacity: 1}}
                        // exit={{y: '100%',opacity: 0.2}}
                        // transition={{type: 'ease'}}

                     >
                    <textarea 
                        className='sf-default-form-container--input'
                        rows="4"
                        placeholder={ selectedRating ? reviewEval[selectedRating - 1]['placeholder'] : '' }
                        value={feedackComment}
                        onChange={(e) => handleFeedbackComment(e.target.value)}
                        >
                            
                    </textarea>
                        <div className="sf-form-submit-button">
                            <UpdateButton
                                text="Submit Feedback"
                                widthFull={true}
                                containerClass='sf-default-form-submit-btn'
                                onBtnClick={() => 
                                    handleSubmit(feedackComment)
                                }
                            />
                        </div>
                        
                    </motion.div>
        }
        else{
            return <div className="sf-form-footer mini">
                        <button
                            className='sf-form-footer--tell-more-btn'
                            onClick={() => setShowFoooter(true)}
                            >
                            Tell us more
                            <ChatIcon className="tell-more-btn-icon"/>
                        </button>
                        <UpdateButton
                            text="Submit Feedback"
                            containerClass='sf-default'
                             onBtnClick={() => 
                                handleSubmit()
                            }
                        />
                    </div>
        }
    }
   const renderForm = () => {
    if(step === 1) return
    if(type){        
        return <>
            <AnimatePresence>

            {step === 2 &&
                <motion.div     
                    key="form"
                    initial={{y: '100%',opacity:0.5}}
                    animate={{y: 0,opacity: 1}}
                    // exit={{y: '100%',opacity: 0.2}}
                    transition={{type: 'ease',delay:'0.05'}}
                    className="sf-default-form-container"
                >
                <p
                    className='sf-default-form-container--question'>
                    <span className='sf-default--question-line'></span>
                    <span className='sf-default--question-text'>{getInfoFromSelectedRating('question')}</span>
                    <span className='sf-default--question-line'></span>
                </p>
                    <div className="sf-default-form-container-tag-container">
                        {filteredTags.length > 0 && filteredTags.map((item, index) => {
                            
                            const isSelected = get(item, 'selected', false)
                            return <Tag
                                        key={index}
                                        isSelected={isSelected}
                                        item={item.name}
                                        handleTags={handleTags}
                                        index={item.id}
                                    />
                            })
                        }
                    </div>
                    {renderFormFooter(true)}

            </motion.div>
        
            }  
            </AnimatePresence>
                    
        </>        
    }
    else{
        return <>
        <motion.div
                className='sf-homework-questions-form'>
                    {filteredTags.map((item,index) => {
                        return <div className="sf-homework-questions-form--item">
                                    <p
                                        className='sf-homework-questions-form--item-question'>
                                        {item.name}
                                    </p>
                                    <div
                                        ref={likeRef}
                                        className="sf-homework-questions-form--item-like-container">
                                    
                                     <Tooltip 
                                        content='Yes'
                                        direction="up">
                                        <div
                                            className={`sf-homework-questions-form--item--like-btn sf-feedback-btn ${item.selected === 'yes' ? 'selected' : ''}`}
                                            onClick={() => {}}
                                            >
                                                <FeedbackIcon 
                                                    type="like"
                                                    selected = {item.selected === 'like'}
                                                >
                                                </FeedbackIcon>                                            
                                        </div>
                                    </Tooltip>
                                    <Tooltip 
                                        like={dislikeRef}
                                        content='No'
                                        direction="up">
                                        <div
                                            className={`sf-homework-questions-form--item--like-btn sf-feedback-btn ${item.selected === 'no' ? 'selected dislike' : ''}`} 
                                            onClick={() =>{}}
                                            >
                                                <FeedbackIcon 
                                                    type="dislike"
                                                    selected = {item.selected === 'no'}
                                                >
                                                </FeedbackIcon>
                                                
                                        </div>
                                    </Tooltip>

                                    
                            </div>
                        </div>

                        }
                    )}
                        
        </motion.div>
        {renderFormFooter(showFooter)}
        </>

    }
   }
  


  return (
    <>
        <div className="sf-default-container">
            <AnimatePresence exitBeforeEnter>
                <motion.div
                key={getInfoFromSelectedRating('characterImg')}
                initial={{ opacity: 0 }}
                animate={{  opacity: 1 }}
                exit={{  opacity: 0 }}
                transition={{ duration: 0.2 }}
                
                className="sf-conji">
                    {
                    selectedRating === 5 && 
                    <div className="sf-conji-stars">
                        <Lottie
                            options={
                                {
                                    autoplay: true,
                                    animationData: stars,
                                    loop: true,
                                    isClickToPauseDisabled: true,
                                    rendererSettings: {
                                    preserveAspectRatio: "xMidYMid slice"
                                    }
                                }
                            }
                            >
                        </Lottie>
                    </div>
                }
                <img src={getInfoFromSelectedRating('characterImg')} alt=""/>
                </motion.div>
            </AnimatePresence>
            
            <div className="sf-default-rating-container">
                <div className="sf-default-rating-container--body">
                    {step !== 3 ?
                    <>
                        <h2>How was your lesson experience?</h2>
                        <p>Your feedback will help us improve our course.</p>
                        {children}

                    </> 
                        :
                    <>
                     <h2 className='sf-submitted-view-container--heading'>Thank you for the Feedback!</h2>
                    <motion.p
                        initial={{opacity:0}}
                        animate={{opacity:1}}
                        exit={{opacity:0}}
                    className='sf-submitted-view-container--subheading'>Your feedback help us improve the
                    experience for all the students!.
                    </motion.p>
      
        
        <UpdatedButton
            text="Continue"
            widthFull
            containerClass="sf-default-form-submit-btn"
            onBtnClick={() => {
                history.push('/sessions')
            }}
            rightIcon
        >
          <ArrowForward
            color='white'
            />
        </UpdatedButton>
                    </>
                }
                </div>
            </div>
            {(step === 2 ) && 
            <div className="sf-bottom-form-container">
                {renderForm()}

            </div>
        }

        </div>
    </>
  )}
const Tag = ({item,isSelected,handleTags,index}) => {
    
    return (
         <div
          className={`sf-default-form-container--tag ${isSelected ? 'selected' : ''}`}
          onClick={() => handleTags({index})}
          >
            {item}
          </div>
    )
}              

export const StarsLottie = () => {
    return <div className="sf-postive-conji-lottie">
        <Lottie
            options={{
                    autoplay: true,
                    animationData: stars,
                    loop: true,
                    isClickToPauseDisabled: true,
                    // rendererSettings: {
                    //   preserveAspectRatio: "xMidYMid slice"
                    // }
                  }}
                  >

            </Lottie>

    </div>
}


export default DefaultView