import React,{useState} from 'react'
import styles from './HelpOverlay.module.scss'
import classNames from 'classnames'
// import {ReactComponent as DownArrow} from '../../../../../assets/downArrow.svg'
import {ReactComponent as CloseIcon} from './assets/cancel.svg'
import { useEffect } from 'react'
import parseMetaTags from '../../../../../utils/parseMetaTags'
import { visibleHintOverlay } from '../../constants'
import {ReactComponent as VideoIcon} from '../../../../../assets/videoIcon.svg'
import { getVideoDuration } from '../../../../../utils/data-utils'
import UpdatedButton from '../../../../../components/Buttons/UpdatedButton/UpdatedButton'
import get from 'lodash/get'
import { checkIfEmbedEnabled } from '../../../../../utils/teacherApp/checkForEmbed'
import TekieCEParser from '../../../../../components/Preview'

const HelpOverlay = ({ visible, closeOverlay,
     answer, hints, isCheckButtonActive, updateAnswersAdditionalInfo,
    onCheckButtonClick, history, videoPath, videoStartTime, videoEndTime, isLearningSlide,
    isMobile, isHintTextExist = true }) => {
    const videoPlayTime = getVideoDuration(
            parseFloat(videoStartTime, 10),
            parseFloat(videoEndTime, 10)
            )
    let checkBtnActiveStyles = {}
    if(isCheckButtonActive){
        checkBtnActiveStyles = {
          border: 'solid 1px #34e4ea',
          color: '#34e4ea',
          backgroundColor:'#fff' 
        }
      }
    const [showAnswer, setShowAnswer] = useState(false)
    const [slideInComponent, setSlideInComponent] = useState(false)
    const [currentHelpIndex, setCurrentHelpIndex] = useState('hint0')


    const onShowAnswerClick=()=>{
        updateAnswersAdditionalInfo(undefined,true)
        setShowAnswer(true)
    }

    useEffect(()=>{
        if (visible) {
            setSlideInComponent(true)
        }
    }, [])
    useEffect(() => {
        if (visible){
            setSlideInComponent(true)
            let activeHelpText = ''
            if (hints.length && isHintTextExist) {
                activeHelpText = 'hint0'
                setCurrentHelpIndex(activeHelpText)
            }
            if (!activeHelpText && answer) {
                onShowAnswerClick()
                setCurrentHelpIndex('explanation')
            }
        }
        else{
            setSlideInComponent(false)
            setCurrentHelpIndex('hint0')
            setShowAnswer(false)
        }
        if (visible) {
            if (!isLearningSlide) {
                if (!hints.length) {
                    updateAnswersAdditionalInfo(undefined,true)
                    setShowAnswer(true)
                }
            }
        }
    }, [visible])
    return(
        <div className={classNames({
            [styles.slideIn]: slideInComponent,
            [styles.slideOut]: !slideInComponent,
            [styles.helpOverlayContainer]: !isMobile,
            [styles.mbHelpOverlayContainer]: isMobile,
            [styles.helpOverlayContainerForTeacherApp]: checkIfEmbedEnabled()
        })}>
            <div className={isMobile ? styles.mbMainArea :styles.mainArea}>
            {/* {!isMobile ?
            (
                <div className={styles.slideDownBtn} onClick={() => { closeOverlay(visibleHintOverlay) }}>
                    <DownArrow />
                </div>
            ) : null} */}
                {!isMobile ? (
                    <>
                    <div className={styles.hintAndExplanationContainer}>
                        {(hints.length && isHintTextExist) ? (
                            <>
                                {(hints.length && isHintTextExist) ? hints.map((hint, ind) => (
                                    <div
                                        onClick={() => {
                                            setCurrentHelpIndex(`hint${ind}`)
                                            if (showAnswer) setShowAnswer(false)
                                        }}
                                        className={classNames(styles.hintText, currentHelpIndex === `hint${ind}` && styles.activeHint)}>HINT {`${hints.length === 1 ? '' : ind + 1}`}</div>
                                )) : null}
                            </>
                        ) : null}
                        {answer ? <div onClick={() =>{
                            setCurrentHelpIndex(`explanation`)
                            onShowAnswerClick()
                        }} className={classNames(styles.hintText, currentHelpIndex === 'explanation' && styles.activeHint)}>EXPLANATION</div> : null}
                    </div>
                    {currentHelpIndex ? (<div className={styles.hintAnsActualText}>
                        {currentHelpIndex === 'explanation' ? (
                            <TekieCEParser
                            id={`hint-ex777 ${currentHelpIndex}`}
                            value={answer}
                            />
                        ) : <TekieCEParser
                            id={`hints-ex777 ${currentHelpIndex}`}
                            value={get(hints, `[${currentHelpIndex.split('hint')[1]}].hint`)}
                        />}
                    </div>) : null}
                    {(videoPlayTime && currentHelpIndex !== 'explanation') ? (
                        <div className={isMobile ? styles.mbTextArea : styles.textAreaUpdated}>
                            <React.Fragment>
                                <div className={isMobile ? styles.mbRecommendationText : styles.recommendationTextUpdated}>
                                    Still not clear?&nbsp;  
                                    <span className={styles.videoRecommendationText}
                                    onClick={()=> history.push(videoPath)}
                                    >Watch a {videoPlayTime} video</span>
                                    {
                                        !isMobile ? <VideoIcon /> :null
                                    }
                                </div>
                            </React.Fragment>
                        </div>
                    ) : null}
                    </>
                ) : null}
                {isMobile ? (
                    <>
                    <div className={isMobile ? styles.mbHeadingArea  : styles.headingArea}>
                    {(hints.length > 0 && isHintTextExist) && ((showAnswer)
                     ?<div className={isMobile ? styles.mbHintHeading : styles.hintHeading} style={{display:'flex',flexDirection:'column',alignItems:'center'}} onClick={()=>setShowAnswer(false)}>HINT</div>
                     :<div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                            <div className={isMobile ? styles.mbHintHeading : styles.hintHeading} style={{ color: '#00ade6' }} 
                            onClick={() => setShowAnswer(false)}>HINT</div>
                         <div className={isMobile ? styles.mbHintUnderline : styles.underline} />
                      </div>
                    )}
                    {answer && ((!showAnswer)
                        ? <div className={isMobile ? styles.mbAnswerHeading : styles.answerHeading} onClick={() => onShowAnswerClick()}>ANSWER</div>
                        : <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ color: '#00ade6' }} className={isMobile ? styles.mbAnswerHeading : styles.answerHeading} onClick={() => { setShowAnswer(true) }}>ANSWER</div>
                            <div className={isMobile ? styles.mbAnswerUnderline : styles.underline} />
                        </div>
                    )}
                </div>
                <div className={isMobile ? styles.mbTextArea : styles.textArea}>
                    {(showAnswer) ? parseMetaTags({statement: answer, removeCodeTag: true, codeTagParser: true }):
                    <React.Fragment>
                         {(hints && hints.length > 0 && isHintTextExist) && hints.map(hintObj => hintObj.hint.length > 0  ? <p>{parseMetaTags({statement : hintObj.hint, removeCodeTag: true, codeTagParser: true })}</p> : null)}
                        {videoPlayTime ? (
                            <div className={isMobile ? styles.mbRecommendationText : styles.recommendationText}>
                                Still not clear?&nbsp;  
                                <span className={styles.videoRecommendationText}
                                onClick={()=> history.push(videoPath)}
                                >Watch a {videoPlayTime} video</span>
                                {
                                    !isMobile ? <VideoIcon /> :null
                                }
                            </div>
                        ) : null}
                    </React.Fragment>
                    }
                </div>
                    </>
                ) : null}
                {isMobile ? (
                    <div className={isMobile ? styles.mbButtonArea : styles.buttonArea}>
                    <div className={isMobile ? styles.mbCloseBtn : styles.closeBtn} onClick={() => { closeOverlay(visibleHintOverlay)}}>
                    Close
                    {isMobile ?  <CloseIcon /> : null}
                    </div>

                    {
                        !isMobile ? 
                        (
                            <div
                            className={styles.checkBtn} 
                            style={checkBtnActiveStyles}
                            onClick={() =>{if (isCheckButtonActive){onCheckButtonClick()}}}>Check</div>
                        ) : null
                    }
                </div>
                ) : (
                    <div className={isMobile ? styles.mbButtonArea : styles.buttonArea}>
                    <UpdatedButton onBtnClick={() => closeOverlay(visibleHintOverlay)} text={'Close'} type={'secondary'}></UpdatedButton>
                    <div className={styles.footerBtnSeparator} />
                    {
                        !isMobile ? 
                        (
                            <UpdatedButton isDisabled={!isCheckButtonActive} onBtnClick={() => {if (isCheckButtonActive){onCheckButtonClick()}}} text='Check' type={!isCheckButtonActive ? 'disabled' : 'primary'}></UpdatedButton>
                        ) : null
                    }
                </div>
                )}
            </div>
         </div>
    )
}

export default HelpOverlay