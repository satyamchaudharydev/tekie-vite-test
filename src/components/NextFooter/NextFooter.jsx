import React from 'react'
import cx from 'classnames';
import { ArrowForward } from '../../constants/icons'
import { Power } from '../../constants/icons'
import UpdatedButton from '../Buttons/UpdatedButton/UpdatedButton'
import styles from './footer.module.scss'
import { useHistory } from 'react-router'
import EndSessionModal from './EndSessionModal'
import { getButtonDetails, handleNext } from './utils'
import { useState } from 'react'
import { get } from 'lodash'
import { checkIfEmbedEnabled, isAccessingTeacherTraining } from '../../utils/teacherApp/checkForEmbed';
import SubmitOverlayMenu from '../../pages/UpdatedSessions/Quiz/components/SubmitOverlayMenu';
import getMe from '../../utils/getMe';
import { useEffect } from 'react';
// if last item is true and last component is true
//  -- the run end session function and text will be end session
// if last item is true and last component is false
//  -- go to the next component
// else run the next item function

function NextFooter({
  loading,
  nextItem = () => {},
  lastItem,
  dumpSession = () => {},
  footerFrom,
  classwork = true,
  saveHomeWork = () => {},
  ...props
}) {
  const { topicId, courseId } = props.match.params
  const { url } = props.match
  const isRevisit = url.includes('revisit')
  // if the topic classType is theory then we don't show next footer
  if(get(props,'topic.classType') === 'theory'){
    return null
  }
  

  return (
    <>
      <div
        className={cx(styles.footerContainer, checkIfEmbedEnabled() && styles.footerContainerForTeacherApp, isAccessingTeacherTraining() && styles.footerContainerForTrainingApp)}
      >
        <NextFooterButton
            {...props}
            topicId={topicId}
            courseId={courseId}
            classwork={classwork}
            isRevisit={isRevisit}
            url={url}
            lastItem={lastItem}
            nextItem={nextItem}
            dumpSession={dumpSession}
            loggedInUser={props.loggedInUser}
            saveHomeWork={saveHomeWork}
            footerFrom={footerFrom}
          />
      </div>
    </>
  )
}
export function NextFooterButton({
  topicId,
  courseId,
  url,
  lastItem,
  nextItem,
  dumpSession,
  loggedInUser,
  footerFrom,
  classwork = true,
  mentorMenteeSession,
  saveHomeWork,
  ...props
}) {
  
    const [isEndSessionModal,setIsEndSessionModal] = useState(false)
    const [isLoading,setIsLoading] = useState(false)
    const [shouldHomeworkSubmitModal, setShouldHomeworkSubmitModal] = useState(false)
    const [currentTopicComponents, setCurrentTopicComponents] = useState([])
    const topic = props.topic
  
    const handleEndSessionModal = (showEndSessionModal,components) => {
      setIsEndSessionModal(showEndSessionModal)
      // don't change the state if the value is same
        setCurrentTopicComponents(components)
      
    }
    const history = useHistory()
    const isRevisit = url && url.includes('revisit')
    const isSubmittedForReview = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isSubmittedForReview'])
    const {label,type,dir,icon} = getButtonDetails({lastItem,topicId,isRevisit,url,isSubmittedForReview,classwork})

    useEffect(() => {
      if (lastItem) {
        localStorage.setItem("endSessionButtonShown", "true");
      } else {
        const endSessionButtonShown = localStorage.getItem("endSessionButtonShown") || false;
        if ([true, 'true', 'True'].includes(endSessionButtonShown)) {
          localStorage.setItem("endSessionButtonShown", "false");
        }
      }
    }, [])

    // handle next button loading
    const handleLoading = (loading) => {
      setIsLoading(loading)
    }
    const renderButtonIcon = () => {
      if(type === 'danger'){
        return <Power color='white' />
      }
      else{
        return <ArrowForward color='white' />
      }
    }
    return (
        <>
      <UpdatedButton
            type={type}
            text={label}
            isLoading={isLoading}
            onBtnClick={() => {
              handleNext(
              {
                topicId,
                isRevisit,
                url,
                lastItem,
                history,
                nextItem,
                handleEndSessionModal,
                dumpSession,
                footerFrom,
                handleLoading,
                classwork,
                setShouldHomeworkSubmitModal,
                isSubmittedForReview,
                saveHomeWork,
              })
            }}
            rightIcon = {dir === 'right'}
            leftIcon = {dir === 'left'}
          >
            {renderButtonIcon()}
          </UpdatedButton>
          {isEndSessionModal &&
              <EndSessionModal
                currentTopicComponents={currentTopicComponents}
                visible={isEndSessionModal}
                loggedInUser={loggedInUser}
                topicId={topicId}
            />
          
          }
          {(shouldHomeworkSubmitModal && !isSubmittedForReview && !classwork) && (
             <SubmitOverlayMenu
              title='Submit for Review'
              visible={shouldHomeworkSubmitModal}
              onQuizSubmit={() => {
                saveHomeWork()
                setShouldHomeworkSubmitModal(false)
              }}
              topic={topic}

              closeOverlay={() => setShouldHomeworkSubmitModal(false)}
              submitForReviewOverlay={false}
              onSubmitForReview={() => {}}
              closeImmediately={true}
              isHomeworkComplete={true}
              userFirstAndLatestQuizReport={props.userFirstAndLatestQuizReport}
              userId={get(getMe(), 'id')}
              topicId={topicId}
              courseId={courseId}
              topicComponentRule={get(topic, 'topicComponentRule')}
              history={history}
              mentorMenteeSessionUpdateStatus={props.mentorMenteeSessionUpdateStatus}
              mentorMenteeSession={mentorMenteeSession}
        />
          )}
         

    </>
    )

}

export default NextFooter