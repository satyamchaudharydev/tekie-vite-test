import React, { useEffect } from 'react'
import { useState } from 'react'
import DefaultView from './components/DefaultView'
import reviewEval from './reviewEval'
import './style.scss'
import Ratings from './components/Ratings'
import SubmittedView from './components/SubmittedView'
import {  AnimateSharedLayout,motion } from 'framer-motion'
import { getFilteredFeedbackTags } from '../NextFooter/utils'
import { useHistory } from 'react-router'
import { addStudentFeedback } from '../NextFooter/addStudentFeedback'
import {usePreviousState } from '../../constants/hooks/usePreviousState'
import getMe from '../../utils/getMe'

function FeedBackModal({onSubmit = () => {},type,components,topicId,...props}) {
  const history = useHistory()
  const [selectedRating, setSelectedRating] = useState(0)
  const prevRating = usePreviousState(selectedRating)
  const [showFooter,setShowFoooter] = useState(false)
  const [step,setStep] = useState(1)
  const [visible,setVisible] = useState(true)
  const [tags,setTags] = useState(getFilteredFeedbackTags({components,rating: false}).filterFeedbackTagsByComponent)
  const [filteredTags,setFilteredTags] = useState(() => getFilteredFeedbackTags({components,rating: [selectedRating]}).filterFeedbackTagsByRating)
  const [feedackComment,setFeedackComment] = useState('')
  const [isContinue,setIsContinue] = useState(false)
  // update the rating after selecting
  useEffect(() => {
    const newTags = getFilteredFeedbackTags({components,rating: false}).filterFeedbackTagsByComponent
    setTags(newTags)
  },[components])
  const updateSelectedRating = (rating) => {
    setFilteredTags(getFilteredFeedbackTags({components,rating: `[${rating}]`}).filterFeedbackTagsByRating)
    setSelectedRating(rating)
  }
  
  // tags selection handle
  const handleTags = ({tagId, homework = false, homeworkType, homeworkIndex}) => {
    if(homework){
        // if(homeworkType === 'yes'){
        //   [...filteredaTags][homeworkIndex].like = 'yes'
        // }
        // else{
        //   [...filteredTags][homeworkIndex].like = 'no'
        // }
    }
    else{
      const newTags = filteredTags.map(tag => {
        if(tag.id === tagId){
          return {...tag,selected: !tag.selected}
        }
        return tag
      })
      setFilteredTags(newTags)
    }
  }
  // handle Feedback comment
  const handleFeedbackComment = (comment) => {
    setFeedackComment(comment)
  }
  // hanlde submit -- shows submitted view
  const handleSubmit = async (feebackComment ,onClose = false) => {
    const {id,batchId,coursePackageId} = getMe()
    const selectedFields = filteredTags.map(tag => {
      const id = tag.id
      if(tag.selected){
        return {tagsConnectId: id, liked: true}
      }
      return null
    }).filter(tag => tag)
    const studentFeedback = selectedRating > 0 ?{
       rating: selectedRating,
        feedbackType: type,
        studentComment: feebackComment,
        selectedFields: selectedFields,
    } : {
      rating: 0,
    }
    addStudentFeedback({
      studentFeedback
      ,
      topicId: topicId,
      batchId: batchId,
      userId: id,
      coursePackageId: coursePackageId
    })
    onClose && history.push('/sessions')

    setStep(3)
  }
  // handle rating -- show form view
  const handleRated = () => {
    setStep(2)
  }
  // renders reviews
  const renderReviews = () => {
  return <Ratings 
            reviewEval={reviewEval}
            selectedRating={selectedRating}
            updateSelectedRating={updateSelectedRating}
            isRated={step === 1}
            handleRated={handleRated}
          />
    
  }
 
  return (
    visible && <motion.div className="sf-feedback-modal-container">
        <AnimateSharedLayout>
          <motion.div
            layout='position'
            className='sf-feedback-modal'>
            <div
              className="sf-feedback-modal--close-btn"
              onClick={() => {
                setVisible(false)
                handleSubmit(feedackComment,true)
              }}
            >
                <svg  viewBox="0 0 21 21">
                  <path id="ic_close_24px" d="M26,7.115,23.885,5,15.5,13.385,7.115,5,5,7.115,13.385,15.5,5,23.885,7.115,26,15.5,17.615,23.885,26,26,23.885,17.615,15.5Z" transform="translate(-5 -5)" fill="#00ADE6"/>
                </svg>

            </div>
                <FormFeedback
                    selectedRating={selectedRating} 
                    reviewEval={reviewEval}
                    step={step}
                    prevRating={prevRating}
                    type={type}
                    setIsContinue={setIsContinue}
                    handleFeedbackComment={handleFeedbackComment}
                    handleSubmit={handleSubmit}
                    handleRated={handleRated}
                    showFooter={showFooter}
                    setShowFoooter={setShowFoooter}
                    tags={tags}
                    filteredTags={filteredTags}
                    handleTags={handleTags}
                    feedackComment={feedackComment}
                    setTags={setTags}
                >
                  {renderReviews()}
                </FormFeedback>
          </motion.div>
    </AnimateSharedLayout>
      </motion.div>

  )
}
 const FormFeedback = ({setIsContinue,selectedRating,feedackComment,reviewEval,handleFeedbackComment,feedbackComment,step,handleSubmit,handleRated,children,showFooter,setShowFoooter,type,tags,setTags,filteredTags,handleTags,}) => {
      if(step === 1 || step === 2 || step === 3   ){
        return <DefaultView
                  type={type}
                  selectedRating={selectedRating} 
                  reviewEval={reviewEval}
                  step={step}
                  filteredTags={filteredTags}
                  feedackComment={feedackComment}
                  handleFeedbackComment= {handleFeedbackComment}
                  handleSubmit={handleSubmit}
                  handleRated={handleRated}
                  setIsContinue={setIsContinue}
                  feedbackComment={feedbackComment}
                  showFooter={showFooter}
                  tags={tags}
                  setTags={setTags}
                  handleTags={handleTags}
                  setShowFoooter={setShowFoooter}
                
                > 
                  {children}         
              </DefaultView>
      }
      else{
        return <SubmittedView
                  selectedRating={selectedRating} 
                  setIsContinue={setIsContinue}
                />
      }
}
export default FeedBackModal