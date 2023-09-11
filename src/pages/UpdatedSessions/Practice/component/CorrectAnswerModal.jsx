import { get } from "lodash"
import React from "react"
import IframeContent from "../../../../components/IframeContent/IframeContent"
import TekieContentEditorParser from "../../../../components/Preview/Preview"
import { CloseIcon } from "../../../../constants/icons"
import '../Practice.scss'

const CorrectAnswerModal = (props) => {
    const { isSeeAnswerVisible, onCloseSeeAnswerModal, blockBasedData, blockBasedPractices } = props

    const renderCorrectAnswer = () => {
        if (get(blockBasedPractices, 'answerFormatDescription')) {
            const answerFormat = get(blockBasedPractices, 'answerFormat')
            if (answerFormat === "answerContent") {
                return <TekieContentEditorParser practice={true} value={get(blockBasedPractices, 'answerFormatDescription')} useNativeHtmlParser={true}/>
            } else if (answerFormat === "answerGoogleEmbedLink") {
                return <IframeContent projectDescription={get(blockBasedPractices, 'answerFormatDescription')} forAnswerLink />
            }
        }
        return null
    }

    return (
        <div className={`practice-see-answer-modal ${isSeeAnswerVisible && 'modal-visible'}`} onClick={onCloseSeeAnswerModal} >
            <div className='practice-see-answer-modal-body'>
                <div className='practice-see-answer-modal-body-header'>
                    <span>Correct Answer</span>
                    <div className='practice-see-answer-modal-closeIcon' onClick={(e) => onCloseSeeAnswerModal(e, true)}><CloseIcon /></div>
                </div>
                <div className='practice-see-answer-modal-hr-line' />
                <div className='practice-see-answer-modal-body-main' style={{
                    height: (get(blockBasedData, 'answerFormat') === 'answerGoogleEmbedLink' && get(blockBasedData, 'answerFormatViewHeight'))
                        ? `${get(blockBasedData, 'answerFormatViewHeight')}px` : '100%'
                }}>{renderCorrectAnswer()}</div>
            </div>
        </div>
    )
}

export default CorrectAnswerModal