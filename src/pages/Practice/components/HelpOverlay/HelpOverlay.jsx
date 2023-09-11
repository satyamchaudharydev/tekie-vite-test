import React,{useState} from 'react'
import styles from './HelpOverlay.module.scss'
import classNames from 'classnames'
import {ReactComponent as DownArrow} from '../../../../assets/downArrow.svg'
import { useEffect } from 'react'
import parseMetaTags from '../../../../utils/parseMetaTags'
import { visibleHintOverlay } from '../../constants'
import {ReactComponent as VideoIcon} from '../../../../assets/videoIcon.svg'
import { getVideoDuration } from '../../../../utils/data-utils'

const HelpOverlay = ({ visible, closeOverlay,
     answer, hint, isCheckButtonActive, updateAnswersAdditionalInfo,
    onCheckButtonClick, history, videoPath, videoStartTime, videoEndTime})=>{
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

    const onShowAnswerClick=()=>{
        updateAnswersAdditionalInfo(undefined,true)
        setShowAnswer(true)
    }

    useEffect(()=>{
        if (visible) {
            setSlideInComponent(true)
        }
    },[])
    useEffect(() => {
        if (visible){
            setSlideInComponent(true)
        }
        else{
            setSlideInComponent(false)
        }
    }, [visible])

    if (visible){
    return(
        <div className={classNames({
            [styles.slideIn]: slideInComponent,
            [styles.slideOut]: !slideInComponent,
            [styles.helpOverlayContainer]: slideInComponent
        })}>
            <div className={styles.mainArea}>
                <div className={styles.slideDownBtn} onClick={() => { closeOverlay(visibleHintOverlay) }}>
                    <DownArrow />
                </div>
                <div className={styles.headingArea}>
                    {(showAnswer)
                     ?<div className={styles.hintHeading} onClick={()=>setShowAnswer(false)}>Hint</div>
                     :<div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                            <div className={styles.hintHeading} style={{ color: '#00ade6' }} 
                            onClick={() => setShowAnswer(false)}>Hint</div>
                         <div className={styles.underline} />
                      </div>
                    }
                    {(!showAnswer)
                        ? <div className={styles.answerHeading} onClick={() => onShowAnswerClick()}>Answer</div>
                        : <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ color: '#00ade6' }} className={styles.answerHeading} onClick={() => { setShowAnswer(true) }}>Answer</div>
                            <div className={styles.underline} />
                        </div>
                    }
                </div>
                <div className={styles.textArea}>
                    {(showAnswer) ? parseMetaTags({statement: answer, removeCodeTag: true, codeTagParser: true }):
                    <React.Fragment>
                        {parseMetaTags({statement: hint, removeCodeTag: true, codeTagParser: true })}
                        <div className={styles.recommendationText}>
                                Still not clear?   
                                <span className={styles.videoRecommendationText}
                                onClick={()=> history.push(videoPath)}
                                >Watch a {videoPlayTime} video</span>
                                <VideoIcon />
                        </div>
                    </React.Fragment>
                    }
                </div>
                <div className={styles.buttonArea}>
                    <div className={styles.closeBtn} onClick={() => { closeOverlay(visibleHintOverlay)}}>Close</div>
                    <div 
                    className={styles.checkBtn} 
                    style={checkBtnActiveStyles}
                        onClick={() =>{if (isCheckButtonActive){onCheckButtonClick()}}}
                    >Check</div>
                </div>
            </div>
         </div>
    )
    }
    else{
        return null
    }
}

export default HelpOverlay